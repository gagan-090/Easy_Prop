import supabase from './supabaseClient.js';
import { validateFirebaseUser } from './supabaseAuthService.js';

// Image Upload to Supabase Storage
export const uploadImagesToStorage = async (images, userId) => {
  try {
    // Validate Firebase user before upload
    const firebaseUser = validateFirebaseUser();
    if (firebaseUser.uid !== userId) {
      throw new Error('User ID mismatch - unauthorized upload attempt');
    }
    
    console.log('📤 Uploading images to Supabase Storage...');
    console.log('📤 Images received:', images);
    const uploadedUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`📤 Processing image ${i}:`, image);
      
      // Handle both formats: {file: File} or File directly
      let file;
      if (image && typeof image === 'object' && image.file) {
        file = image.file;
      } else if (image instanceof File) {
        file = image;
      } else {
        console.warn('⚠️ Skipping image without valid file object:', image);
        continue;
      }
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}_${i}.${fileExt}`;
      const filePath = `properties/${userId}/${fileName}`;
      
      console.log(`📁 Uploading ${fileName} to ${filePath}...`);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error(`❌ Error uploading ${fileName}:`, error);
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);
      
      console.log(`✅ Successfully uploaded ${fileName}:`, publicUrl);
      uploadedUrls.push(publicUrl);
    }
    
    console.log('🎉 All images uploaded successfully:', uploadedUrls);
    return uploadedUrls;
  } catch (error) {
    console.error('❌ Error uploading images to storage:', error);
    throw error;
  }
};

// User Profile Management
export const createUserProfile = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        user_type: userData.user_type || 'agent',
        company: userData.company,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
          totalProperties: 0,
          propertiesForSale: 0,
          propertiesForRent: 0,
          totalCustomers: 0,
          totalCities: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalLeads: 0,
          activeLeads: 0,
          convertedLeads: 0
        },
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true
        }
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    console.log('🔍 getUserProfile called for userId:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('📊 getUserProfile result:', { data, error });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('🔄 Updating user profile for:', userId, 'with:', updates);
    
    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('👤 Existing user check:', { existingUser, checkError });
    
    if (checkError) {
      throw checkError;
    }
    
    if (!existingUser) {
      console.log('⚠️ User not found, creating profile first...');
      // User doesn't exist, create profile first
      const createResult = await createUserProfile(userId, {
        email: `${userId}@temp.com`, // Temporary email
        name: 'User',
        user_type: updates.user_type || 'agent',
        // Only include company if it's in the updates
        ...(updates.company !== undefined && { company: updates.company })
      });
      
      if (!createResult.success) {
        throw new Error(`Failed to create user profile: ${createResult.error}`);
      }
      
      return createResult;
    }
    
    // User exists, update it
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ User profile updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Property Management
export const addProperty = async (userId, propertyData) => {
  try {
    console.log('📝 Adding property to Supabase:', { userId, propertyData });
    
    // Images are already uploaded and URLs are provided in propertyData.images
    const imageUrls = propertyData.images || [];
    console.log('📸 Using provided image URLs:', imageUrls);
    console.log('📸 Number of image URLs:', imageUrls.length);
    if (imageUrls.length === 0) {
      console.log('⚠️ WARNING: No image URLs provided to addProperty');
    }
    
    // Get Firebase user data for creating Supabase profile
    const firebaseUser = validateFirebaseUser();
    
    // First, check if user exists in Supabase users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error
    
    // If user doesn't exist, create a basic user profile using Firebase data
    if (!existingUser && !userCheckError) {
      console.log('👤 User not found in Supabase, creating user profile...');
      
      // Create a unique email to avoid conflicts
      const uniqueEmail = `${userId}@firebase-user.temp`;
      
      const { error: createUserError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: uniqueEmail,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          user_type: 'agent', // Default to agent for existing users
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
          email_verified: firebaseUser.emailVerified || false,
          phone_verified: !!firebaseUser.phoneNumber,
          stats: {
            totalProperties: 0,
            propertiesForSale: 0,
            propertiesForRent: 0,
            totalCustomers: 0,
            totalCities: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalLeads: 0,
            activeLeads: 0,
            convertedLeads: 0
          },
          preferences: {
            theme: 'light',
            notifications: true,
            emailUpdates: true
          },
          profile: {},
          subscription: {}
        }]);
      
      if (createUserError) {
        console.error('❌ Error creating user profile:', createUserError);
        return { success: false, error: `Failed to create user profile: ${createUserError.message}` };
      }
      
      console.log('✅ User profile created successfully');
    } else if (userCheckError) {
      console.error('❌ Error checking user:', userCheckError);
      return { success: false, error: `Failed to check user: ${userCheckError.message}` };
    }
    
    const property = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      title: propertyData.title,
      description: propertyData.description,
      price: parseFloat(propertyData.price) || 0,
      address: propertyData.location || propertyData.address,
      city: propertyData.city || 'Unknown',
      state: propertyData.state || 'Unknown',
      country: propertyData.country || 'India',
      pincode: propertyData.pincode,
      locality: propertyData.locality,
      landmark: propertyData.landmark,
      bedrooms: parseInt(propertyData.bedrooms) || 0,
      bathrooms: parseInt(propertyData.bathrooms) || 0,
      area: parseInt(propertyData.area) || 0,
      built_up_area: parseInt(propertyData.built_up_area) || 0,
      carpet_area: parseInt(propertyData.carpet_area) || 0,
      balconies: parseInt(propertyData.balconies) || 0,
      parking: parseInt(propertyData.parking) || 0,
      floor: parseInt(propertyData.floor) || 0,
      total_floors: parseInt(propertyData.total_floors) || 0,
      type: propertyData.type || 'sale',
      category: propertyData.category || 'residential',
      property_type: propertyData.property_type || 'apartment',
      status: propertyData.status || 'active',
      availability: propertyData.availability || 'immediate',
      currency: propertyData.currency || 'INR',
      price_per_sqft: parseFloat(propertyData.price_per_sqft) || 0,
      negotiable: propertyData.negotiable !== false,
      age_of_property: parseInt(propertyData.age_of_property) || 0,
      facing: propertyData.facing || 'north',
      source: propertyData.source || 'direct',
      furnishing: propertyData.furnishing || 'unfurnished',
      contact_preference: propertyData.contact_preference || 'both',
      best_time_to_call: propertyData.best_time_to_call || 'anytime',
      featured: propertyData.featured || false,
      premium: propertyData.premium || false,
      verified: propertyData.verified || false,
      views: 0,
      inquiries: 0,
      favorites: 0,
      shares: 0,
      images: imageUrls, // Use the uploaded image URLs instead of blob URLs
      videos: propertyData.videos || [],
      amenities: propertyData.amenities || [],
      features: propertyData.features || [],
      tags: propertyData.tags || [],
      keywords: propertyData.keywords || [],
      virtual_tour: propertyData.virtual_tour,
      floor_plan: propertyData.floor_plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user stats
    await updateUserStats(userId, {
      totalProperties: 1,
      [propertyData.type === 'sale' ? 'propertiesForSale' : 'propertiesForRent']: 1
    });
    
    // Update totalCities by calculating unique cities from user's properties
    await updateTotalCities(userId);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding property:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProperties = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user properties:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProperty = async (userId, propertyId) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user property:', error);
    return { success: false, error: error.message };
  }
};

export const updateProperty = async (propertyId, updates) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) throw error;
    
    // If city was updated, recalculate totalCities for the user
    if (updates.city && data.user_id) {
      await updateTotalCities(data.user_id);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error: error.message };
  }
};

export const addPropertyView = async (propertyId, userId) => {
  try {
    // Generate a session ID for anonymous users
    const sessionId = userId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this view already exists for this user/session
    const { data: existingView, error: checkError } = await supabase
      .from('property_views')
      .select('id')
      .eq('property_id', propertyId)
      .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing view:', checkError);
    }

    // If view already exists, don't count it again
    if (existingView) {
      return { success: true, message: 'View already recorded for this session.' };
    }

    // Record the new view - let database generate UUID automatically
    const viewData = {
      property_id: propertyId,
      user_id: userId || null,
      session_id: sessionId,
      viewed_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('property_views')
      .insert([viewData]);

    if (insertError) {
      console.error('Error inserting property view:', insertError);
      throw insertError;
    }

    // Increment the view count on the property
    const { data: currentProperty, error: propertyError } = await supabase
      .from('properties')
      .select('views')
      .eq('id', propertyId)
      .single();
    
    if (!propertyError && currentProperty) {
      const newViewsCount = (currentProperty.views || 0) + 1;
      await supabase
        .from('properties')
        .update({ views: newViewsCount })
        .eq('id', propertyId);
    }

    console.log(`✅ Property view recorded for property ${propertyId} by ${userId ? 'user' : 'anonymous'}`);
    return { success: true, data: viewData };
  } catch (error) {
    console.error('Error adding property view:', error);
    return { success: false, error: error.message };
  }
};


export const deleteProperty = async (userId, propertyId, propertyType) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Update user stats
    await updateUserStats(userId, {
      totalProperties: -1,
      [propertyType === 'sale' ? 'propertiesForSale' : 'propertiesForRent']: -1
    });
    
    // Update totalCities by recalculating based on remaining properties
    await updateTotalCities(userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: error.message };
  }
};

// Public Data Fetching
export const getFeaturedProperty = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, users(name, profile, company)')
      .eq('featured', true)
      .limit(1)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting featured property:', error);
    return { success: false, error: error.message };
  }
};

export const getPopularProperties = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, users(name, profile, company)')
      .order('views', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting popular properties:', error);
    return { success: false, error: error.message };
  }
};

export const getRecentProperties = async (limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting recent properties:', error);
    return { success: false, error: error.message };
  }
};

export const getTopSellers = async (limit = 4) => {
  try {
    // This is a simplified way to get "top sellers". A real implementation
    // might use ratings or sales data. Here we use recent activity as a proxy.
    const { data, error } = await supabase
      .from('users')
      .select('id, name, company, stats, profile')
      .in('user_type', ['agent', 'builder'])
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting top sellers:', error);
    return { success: false, error: error.message };
  }
};

export const getHomepageStats = async () => {
  try {
    const { count: propertiesListed, error: pError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    if (pError) throw pError;

    const { count: expertAgents, error: aError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('user_type', ['agent', 'builder']);
    if (aError) throw aError;
    
    // This is inefficient but the only way without a dedicated RPC function
    const { data: cities, error: cError } = await supabase
      .from('properties')
      .select('city');
    if (cError) throw cError;
    const citiesCovered = new Set(cities.map(p => p.city).filter(c => c)).size;

    // Happy customers is a business metric, often manually set.
    // We'll use a base number + number of sold properties for a dynamic feel.
    const { count: soldProperties, error: custError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');
    if (custError) throw custError;

    const happyCustomers = (soldProperties || 0) + 5000; // Base number of 5000

    return {
      success: true,
      data: {
        propertiesListed,
        happyCustomers,
        expertAgents,
        citiesCovered,
      }
    };
  } catch (error) {
    console.error('Error getting homepage stats:', error);
    return { success: false, error: error.message };
  }
};

export const getAllProperties = async (filters = {}) => {
  try {
    let query = supabase
      .from('properties')
      .select('*, users(name, profile, company)')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (min) query = query.gte('price', min);
      if (max) query = query.lte('price', max);
    }
    if (filters.bhk) {
      if (filters.bhk === '4+') {
        query = query.gte('bedrooms', 4);
      } else {
        query = query.eq('bedrooms', parseInt(filters.bhk));
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting all properties:', error);
    return { success: false, error: error.message };
  }
};

export const getNearbyPropertiesByCoordinates = async (latitude, longitude) => {
  try {
    console.log('📍 Getting nearby properties by coordinates:', { latitude, longitude });
    
    // For now, return empty array since we don't have geospatial functions
    // In a real implementation, you would use PostGIS or similar for distance calculations
    console.log('⚠️ Geospatial queries not implemented - returning empty results');
    return { success: true, data: [] };
  } catch (error) {
    console.error('❌ Error getting nearby properties by coordinates:', error);
    return { success: false, error: error.message };
  }
};

export const getPropertyById = async (propertyId) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, users(*)')
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting property by ID:', error);
    return { success: false, error: error.message };
  }
};

// Get nearby properties based on location and price range
export const getNearbyProperties = async (currentProperty, limit = 6) => {
  try {
    if (!currentProperty) {
      return { success: false, error: 'Current property data required' };
    }

    const priceRange = {
      min: currentProperty.price * 0.7, // 30% below
      max: currentProperty.price * 1.3  // 30% above
    };

    const { data, error } = await supabase
      .from('properties')
      .select('*, users(*)')
      .neq('id', currentProperty.id) // Exclude current property
      .eq('status', 'active')
      .or(`city.ilike.%${currentProperty.city}%,locality.ilike.%${currentProperty.locality}%`)
      .gte('price', priceRange.min)
      .lte('price', priceRange.max)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting nearby properties:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// This function was removed to avoid duplication - using the more comprehensive version below

// Property View Analytics
export const getPropertyViewAnalytics = async (propertyId, daysBack = 30) => {
  try {
    console.log('📊 Getting property view analytics for:', propertyId);
    
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Get the property's current view count
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('views')
      .eq('id', propertyId)
      .single();
    
    if (propertyError) throw propertyError;
    
    // Get recent views within the date range
    const { data: recentViews, error: viewsError } = await supabase
      .from('property_views')
      .select('viewed_at')
      .eq('property_id', propertyId)
      .gte('viewed_at', startDate.toISOString())
      .lte('viewed_at', endDate.toISOString());
    
    if (viewsError) throw viewsError;
    
    // Calculate analytics
    const totalViews = property.views || 0;
    const recentViewsCount = recentViews.length;
    
    // Group views by day for trend analysis
    const viewsByDay = {};
    recentViews.forEach(view => {
      const date = new Date(view.viewed_at).toDateString();
      viewsByDay[date] = (viewsByDay[date] || 0) + 1;
    });
    
    // Calculate average daily views
    const uniqueDays = Object.keys(viewsByDay).length;
    const averageDailyViews = uniqueDays > 0 ? Math.round(recentViewsCount / uniqueDays) : 0;
    
    // Get peak viewing day
    let peakDay = null;
    let peakViews = 0;
    Object.entries(viewsByDay).forEach(([day, count]) => {
      if (count > peakViews) {
        peakViews = count;
        peakDay = day;
      }
    });
    
    const analytics = {
      total_views: totalViews,
      recent_views: recentViewsCount,
      average_daily_views: averageDailyViews,
      peak_day: peakDay,
      peak_views: peakViews,
      views_by_day: viewsByDay,
      days_analyzed: daysBack
    };
    
    console.log('✅ Property view analytics calculated successfully');
    return { success: true, data: analytics };
  } catch (error) {
    console.error('❌ Error getting property view analytics:', error);
    return { success: false, error: error.message };
  }
};

// Get user's properties with view analytics
export const getUserPropertiesWithAnalytics = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data: properties, error } = await query;
    
    if (error) throw error;

    // Get analytics for each property
    const propertiesWithAnalytics = await Promise.all(
      properties.map(async (property) => {
        const analytics = await getPropertyViewAnalytics(property.id, 30);
        return {
          ...property,
          analytics: analytics.success ? analytics.data : {}
        };
      })
    );

    return { success: true, data: propertiesWithAnalytics };
  } catch (error) {
    console.error('Error getting user properties with analytics:', error);
    return { success: false, error: error.message };
  }
};

// Get recent views for a property
export const getPropertyRecentViews = async (propertyId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('property_views')
      .select('*')
      .eq('property_id', propertyId)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting property recent views:', error);
    return { success: false, error: error.message };
  }
};

// Get user's total view analytics
export const getUserViewAnalytics = async (userId) => {
  try {
    // Get all properties for the user
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, views')
      .eq('user_id', userId);

    if (propertiesError) throw propertiesError;

    // Calculate total views
    const totalViews = properties.reduce((sum, property) => sum + (property.views || 0), 0);
    
    // Get recent views (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentViews, error: viewsError } = await supabase
      .from('property_views')
      .select('property_id, viewed_at')
      .in('property_id', properties.map(p => p.id))
      .gte('viewed_at', thirtyDaysAgo.toISOString());

    if (viewsError) throw viewsError;

    const recentViewsCount = recentViews.length;
    const uniqueViewers = new Set(recentViews.map(v => v.property_id)).size;

    return {
      success: true,
      data: {
        totalViews,
        recentViews: recentViewsCount,
        uniqueViewers,
        totalProperties: properties.length,
        averageViewsPerProperty: properties.length > 0 ? Math.round(totalViews / properties.length) : 0
      }
    };
  } catch (error) {
    console.error('Error getting user view analytics:', error);
    return { success: false, error: error.message };
  }
};

// Tour Management
export const scheduleTour = async (tourData) => {
  try {
    console.log('📅 Scheduling tour:', tourData);
    
    const tour = {
      id: `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      property_id: tourData.property_id,
      property_owner_id: tourData.property_owner_id,
      visitor_name: tourData.visitor_name,
      visitor_email: tourData.visitor_email,
      visitor_phone: tourData.visitor_phone,
      visitor_message: tourData.visitor_message || '',
      tour_date: tourData.tour_date,
      tour_time: tourData.tour_time,
      status: 'pending',
      tour_type: tourData.tour_type || 'physical',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tours')
      .insert([tour])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Tour scheduled successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error scheduling tour:', error);
    return { success: false, error: error.message };
  }
};

export const getUserTours = async (userId, filters = {}) => {
  try {
    console.log('📋 Getting tours for user:', userId, 'with filters:', filters);
    
    let query = supabase
      .from('tours')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          images,
          price,
          property_type
        )
      `)
      .eq('property_owner_id', userId)
      .order('tour_datetime', { ascending: true });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.upcoming) {
      query = query.gte('tour_datetime', new Date().toISOString());
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log('✅ Tours fetched successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error getting user tours:', error);
    return { success: false, error: error.message };
  }
};

export const updateTourStatus = async (tourId, status, userId) => {
  try {
    console.log('🔄 Updating tour status:', { tourId, status, userId });
    
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('tours')
      .update(updates)
      .eq('id', tourId)
      .eq('property_owner_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Tour status updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating tour status:', error);
    return { success: false, error: error.message };
  }
};

export const getTourById = async (tourId, userId) => {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          images,
          price,
          property_type,
          user_id
        )
      `)
      .eq('id', tourId)
      .eq('property_owner_id', userId)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error getting tour by ID:', error);
    return { success: false, error: error.message };
  }
};

export const getTourStatistics = async (userId) => {
  try {
    console.log('📊 Getting tour statistics for user:', userId);
    
    // Get all tours for the user
    const { data: allTours, error: toursError } = await supabase
      .from('tours')
      .select('status, created_at, tour_date')
      .eq('property_owner_id', userId);
    
    if (toursError) throw toursError;
    
    // Calculate statistics
    const totalTours = allTours.length;
    const pendingTours = allTours.filter(tour => tour.status === 'pending').length;
    const confirmedTours = allTours.filter(tour => tour.status === 'confirmed').length;
    const completedTours = allTours.filter(tour => tour.status === 'completed').length;
    const cancelledTours = allTours.filter(tour => tour.status === 'cancelled').length;
    
    // Calculate upcoming tours (tours with future dates)
    const now = new Date();
    const upcomingTours = allTours.filter(tour => {
      if (!tour.tour_date) return false;
      const tourDate = new Date(tour.tour_date);
      return tourDate > now && tour.status !== 'cancelled';
    }).length;
    
    // Calculate conversion rate
    const conversionRate = totalTours > 0 ? Math.round((completedTours / totalTours) * 100) : 0;
    
    const statistics = {
      total_tours: totalTours,
      pending_tours: pendingTours,
      confirmed_tours: confirmedTours,
      completed_tours: completedTours,
      cancelled_tours: cancelledTours,
      upcoming_tours: upcomingTours,
      conversion_rate: conversionRate
    };
    
    console.log('✅ Tour statistics calculated:', statistics);
    return { success: true, data: statistics };
  } catch (error) {
    console.error('❌ Error getting tour statistics:', error);
    return { success: false, error: error.message };
  }
};

export const getUpcomingTours = async (userId, limit = 10) => {
  try {
    console.log('📅 Getting upcoming tours for user:', userId);
    
    const now = new Date();
    
    const { data, error } = await supabase
      .from('tours')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          images,
          price,
          property_type
        )
      `)
      .eq('property_owner_id', userId)
      .gte('tour_date', now.toISOString())
      .neq('status', 'cancelled')
      .order('tour_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    
    console.log('✅ Upcoming tours fetched successfully');
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error getting upcoming tours:', error);
    return { success: false, error: error.message };
  }
};

export const addTourFeedback = async (tourId, feedback, userId) => {
  try {
    const { data, error } = await supabase
      .from('tours')
      .update({
        agent_feedback: feedback.agent_feedback,
        agent_rating: feedback.agent_rating,
        agent_notes: feedback.agent_notes,
        follow_up_required: feedback.follow_up_required,
        follow_up_date: feedback.follow_up_date,
        follow_up_notes: feedback.follow_up_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', tourId)
      .eq('property_owner_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error adding tour feedback:', error);
    return { success: false, error: error.message };
  }
};

// Lead Management




export const addLead = async (userId, leadData) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...leadData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'new'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user stats
    await updateUserStats(userId, {
      totalLeads: 1,
      activeLeads: 1
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding lead:', error);
    return { success: false, error: error.message };
  }
};

export const getUserLeads = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user leads:', error);
    return { success: false, error: error.message };
  }
};

export const updateLeadStatus = async (userId, leadId, oldStatus, newStatus) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, error: error.message };
  }
};

// Revenue Management
export const addRevenue = async (userId, revenueData) => {
  try {
    console.log('🔍 addRevenue: Adding revenue for user:', userId);
    console.log('🔍 addRevenue: Revenue data:', revenueData);
    
    const { data, error } = await supabase
      .from('revenue')
      .insert([{
        id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...revenueData,
        user_id: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('🔍 addRevenue: Revenue added successfully:', data);
    
    // Update user stats
    await updateUserStats(userId, {
      totalRevenue: revenueData.amount,
      monthlyRevenue: revenueData.amount
    });
    
    console.log('🔍 addRevenue: User stats updated');
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding revenue:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRevenue = async (userId, timeframe = 'all') => {
  try {
    console.log('🔍 getUserRevenue: Fetching revenue for user:', userId);
    console.log('🔍 getUserRevenue: Timeframe:', timeframe);
    
    let query = supabase
      .from('revenue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    console.log('🔍 getUserRevenue: Query result:', { data, error });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user revenue:', error);
    return { success: false, error: error.message };
  }
};

// Analytics
export const getDashboardStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('stats')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      data: data?.stats || {
        totalProperties: 0,
        propertiesForSale: 0,
        propertiesForRent: 0,
        totalCustomers: 0,
        totalCities: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalLeads: 0,
        activeLeads: 0,
        convertedLeads: 0
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to update user stats
const updateUserStats = async (userId, statUpdates) => {
  try {
    const { data: currentUser } = await supabase
      .from('users')
      .select('stats')
      .eq('id', userId)
      .single();
    
    if (currentUser) {
      const updatedStats = { ...currentUser.stats };
      
      Object.keys(statUpdates).forEach(key => {
        if (updatedStats[key] !== undefined) {
          updatedStats[key] += statUpdates[key];
        }
      });
      
      await supabase
        .from('users')
        .update({
          stats: updatedStats,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// Helper function to update totalCities based on user's properties
const updateTotalCities = async (userId) => {
  try {
    // Get all properties for the user
    const { data: properties, error } = await supabase
      .from('properties')
      .select('city')
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching properties for totalCities calculation:', error);
      return;
    }
    
    // Calculate unique cities
    const uniqueCities = new Set();
    properties.forEach(property => {
      if (property.city && property.city.trim() !== '') {
        uniqueCities.add(property.city.trim());
      }
    });
    
    const totalCities = uniqueCities.size;
    
    // Update the totalCities stat directly (not using updateUserStats to avoid addition)
    const { data: currentUser } = await supabase
      .from('users')
      .select('stats')
      .eq('id', userId)
      .single();
    
    if (currentUser) {
      const updatedStats = { ...currentUser.stats, totalCities };
      
      await supabase
        .from('users')
        .update({
          stats: updatedStats,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      console.log(`✅ Updated totalCities to ${totalCities} for user ${userId}`);
    }
  } catch (error) {
    console.error('Error updating totalCities:', error);
  }
};

// Utility function to recalculate totalCities for all users (for fixing existing data)
export const recalculateAllUsersTotalCities = async () => {
  try {
    console.log('🔄 Starting totalCities recalculation for all users...');
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { success: false, error: usersError.message };
    }
    
    let updatedCount = 0;
    for (const user of users) {
      await updateTotalCities(user.id);
      updatedCount++;
    }
    
    console.log(`✅ Recalculated totalCities for ${updatedCount} users`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error recalculating totalCities for all users:', error);
    return { success: false, error: error.message };
  }
};

// Favorites Management
export const addToFavorites = async (userId, propertyId) => {
  try {
    console.log('❤️ Adding property to favorites:', { userId, propertyId });
    
    // Check if already in favorites
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing favorite:', checkError);
      throw checkError;
    }
    
    if (existingFavorite) {
      console.log('⚠️ Property already in favorites');
      return { success: true, message: 'Property already in favorites' };
    }
    
    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        property_id: propertyId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Property added to favorites successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    return { success: false, error: error.message };
  }
};

export const removeFromFavorites = async (userId, propertyId) => {
  try {
    console.log('💔 Removing property from favorites:', { userId, propertyId });
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);
    
    if (error) throw error;
    
    console.log('✅ Property removed from favorites successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    return { success: false, error: error.message };
  }
};

export const getUserFavorites = async (userId) => {
  try {
    console.log('📋 Getting user favorites for:', userId);
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          price,
          images,
          property_type,
          bedrooms,
          bathrooms,
          area,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('✅ User favorites fetched successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error getting user favorites:', error);
    return { success: false, error: error.message };
  }
};

// Similar Properties
export const getSimilarProperties = async (propertyId, limit = 4) => {
  try {
    console.log('🔍 Getting similar properties for:', propertyId);
    
    // First get the current property to understand its characteristics
    const { data: currentProperty, error: propertyError } = await supabase
      .from('properties')
      .select('city, property_type, bedrooms, price, type')
      .eq('id', propertyId)
      .single();
    
    if (propertyError) throw propertyError;
    
    // Find similar properties based on location and type
    let query = supabase
      .from('properties')
      .select('*, users(name, profile, company)')
      .eq('status', 'active')
      .neq('id', propertyId)
      .limit(limit);
    
    // Filter by same city if available
    if (currentProperty.city) {
      query = query.eq('city', currentProperty.city);
    }
    
    // Filter by same property type if available
    if (currentProperty.property_type) {
      query = query.eq('property_type', currentProperty.property_type);
    }
    
    // Filter by similar price range (±20%)
    if (currentProperty.price) {
      const minPrice = currentProperty.price * 0.8;
      const maxPrice = currentProperty.price * 1.2;
      query = query.gte('price', minPrice).lte('price', maxPrice);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log('✅ Similar properties fetched successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error getting similar properties:', error);
    return { success: false, error: error.message };
  }
};

// Property Views
export const getPropertyViews = async (propertyId, limit = 10) => {
  try {
    console.log('👁️ Getting property views for:', propertyId);
    
    const { data, error } = await supabase
      .from('property_views')
      .select('*')
      .eq('property_id', propertyId)
      .order('viewed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    console.log('✅ Property views fetched successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error getting property views:', error);
    return { success: false, error: error.message };
  }
};

// Property Analytics
export const getPropertyAnalytics = async (propertyId, daysBack = 30) => {
  try {
    console.log('📊 Getting property analytics for:', propertyId);
    
    // Get view analytics
    const viewAnalytics = await getPropertyViewAnalytics(propertyId, daysBack);
    
    // Get recent views
    const recentViews = await getPropertyViews(propertyId, 10);
    
    // Get similar properties
    const similarProperties = await getSimilarProperties(propertyId, 4);
    
    const analytics = {
      views: viewAnalytics.success ? viewAnalytics.data : {},
      recentViews: recentViews.success ? recentViews.data : [],
      similarProperties: similarProperties.success ? similarProperties.data : [],
      totalViews: viewAnalytics.success ? viewAnalytics.data.total_views || 0 : 0,
      recentViewsCount: recentViews.success ? recentViews.data.length : 0,
      similarPropertiesCount: similarProperties.success ? similarProperties.data.length : 0
    };
    
    console.log('✅ Property analytics fetched successfully');
    return { success: true, data: analytics };
  } catch (error) {
    console.error('❌ Error getting property analytics:', error);
    return { success: false, error: error.message };
  }
};
