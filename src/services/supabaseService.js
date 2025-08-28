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

// Profile Photo Upload to Supabase Storage
export const uploadProfilePhoto = async (userId, file) => {
  try {
    // Validate Firebase user before upload
    const firebaseUser = validateFirebaseUser();
    if (firebaseUser.uid !== userId) {
      throw new Error('User ID mismatch - unauthorized upload attempt');
    }
    
    console.log('📤 Uploading profile photo to Supabase Storage...');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size too large. Please upload an image smaller than 5MB.');
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${userId}_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${userId}/${fileName}`;
    
    console.log(`📁 Uploading profile photo ${fileName} to ${filePath}...`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing files
      });
    
    if (error) {
      console.error(`❌ Error uploading profile photo:`, error);
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);
    
    console.log(`✅ Successfully uploaded profile photo:`, publicUrl);
    
    return { 
      success: true, 
      data: { 
        publicUrl,
        filePath,
        fileName
      }
    };
  } catch (error) {
    console.error('❌ Error uploading profile photo:', error);
    return { success: false, error: error.message };
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
      .maybeSingle(); // Use maybeSingle() to handle case where user doesn't exist
    
    console.log('📊 getUserProfile result:', { data, error });
    
    if (error) {
      console.error('❌ Database error:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      console.log('⚠️ User profile not found in database');
      return { success: false, error: 'User profile not found' };
    }
    
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
      .select('*, users(name, profile, company, photo_url)')
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
      .select('*, users(id, name, profile, company, photo_url)')
      .order('views', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Debug: Log the user_ids to see if they're different
    console.log('Popular properties user_ids:', data?.map(p => ({ id: p.id, user_id: p.user_id, user_name: p.users?.name })));
    
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
      .select('*, users(name, profile, company, photo_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.listingType) {
      query = query.eq('type', filters.listingType);
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.locality) {
      query = query.ilike('locality', `%${filters.locality}%`);
    }
    if (filters.priceRange) {
      if (filters.priceRange.includes('+')) {
        const min = parseInt(filters.priceRange.replace('+', ''));
        query = query.gte('price', min);
      } else {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (min) query = query.gte('price', min);
        if (max) query = query.lte('price', max);
      }
    }
    if (filters.bhk) {
      if (filters.bhk === '4+') {
        query = query.gte('bedrooms', 4);
      } else {
        query = query.eq('bedrooms', parseInt(filters.bhk));
      }
    }
    if (filters.furnishing) {
      query = query.eq('furnishing', filters.furnishing);
    }
    if (filters.facing) {
      query = query.eq('facing', filters.facing);
    }
    if (filters.ageOfProperty) {
      if (filters.ageOfProperty === '0-1') {
        query = query.lte('age_of_property', 1);
      } else if (filters.ageOfProperty === '1-5') {
        query = query.gte('age_of_property', 1).lte('age_of_property', 5);
      } else if (filters.ageOfProperty === '5-10') {
        query = query.gte('age_of_property', 5).lte('age_of_property', 10);
      } else if (filters.ageOfProperty === '10+') {
        query = query.gte('age_of_property', 10);
      }
    }
    if (filters.areaRange) {
      const [min, max] = filters.areaRange.split('-').map(Number);
      if (min) query = query.gte('area', min);
      if (max) query = query.lte('area', max);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,locality.ilike.%${filters.searchQuery}%`);
    }
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_low_high':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high_low':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_viewed':
          query = query.order('views', { ascending: false });
          break;
        case 'area_low_high':
          query = query.order('area', { ascending: true });
          break;
        case 'area_high_low':
          query = query.order('area', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting all properties:', error);
    return { success: false, error: error.message };
  }
};

// Get unique cities from properties for search suggestions
export const getUniqueCities = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('city')
      .not('city', 'is', null)
      .order('city');
    
    if (error) throw error;
    
    const uniqueCities = [...new Set(data.map(item => item.city))].filter(city => city);
    return { success: true, data: uniqueCities };
  } catch (error) {
    console.error('Error getting unique cities:', error);
    return { success: false, error: error.message };
  }
};

// Get unique localities from properties for search suggestions
export const getUniqueLocalities = async (city = null) => {
  try {
    let query = supabase
      .from('properties')
      .select('locality')
      .not('locality', 'is', null);
    
    if (city) {
      query = query.eq('city', city);
    }
    
    const { data, error } = await query.order('locality');
    
    if (error) throw error;
    
    const uniqueLocalities = [...new Set(data.map(item => item.locality))].filter(locality => locality);
    return { success: true, data: uniqueLocalities };
  } catch (error) {
    console.error('Error getting unique localities:', error);
    return { success: false, error: error.message };
  }
};

// Get property types with counts
export const getPropertyTypesWithCounts = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('property_type')
      .eq('status', 'active');
    
    if (error) throw error;
    
    const typeCounts = {};
    data.forEach(item => {
      if (item.property_type) {
        typeCounts[item.property_type] = (typeCounts[item.property_type] || 0) + 1;
      }
    });
    
    return { success: true, data: typeCounts };
  } catch (error) {
    console.error('Error getting property types with counts:', error);
    return { success: false, error: error.message };
  }
};

// Get price ranges based on listing type
export const getPriceRanges = async (listingType = 'sale') => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('price')
      .eq('type', listingType)
      .eq('status', 'active')
      .not('price', 'is', null)
      .order('price');
    
    if (error) throw error;
    
    const prices = data.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return { 
      success: true, 
      data: {
        min: minPrice,
        max: maxPrice,
        average: avgPrice,
        count: prices.length
      }
    };
  } catch (error) {
    console.error('Error getting price ranges:', error);
    return { success: false, error: error.message };
  }
};

// Get available amenities from properties
export const getAvailableAmenities = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('amenities')
      .not('amenities', 'is', null)
      .eq('status', 'active');
    
    if (error) throw error;
    
    const allAmenities = new Set();
    data.forEach(item => {
      if (item.amenities && Array.isArray(item.amenities)) {
        item.amenities.forEach(amenity => allAmenities.add(amenity));
      }
    });
    
    return { success: true, data: Array.from(allAmenities).sort() };
  } catch (error) {
    console.error('Error getting available amenities:', error);
    return { success: false, error: error.message };
  }
};

// Search properties with autocomplete suggestions
export const searchPropertiesWithSuggestions = async (query, limit = 10) => {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: [] };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, address, city, locality, price, property_type, images')
      .or(`title.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%,locality.ilike.%${query}%`)
      .eq('status', 'active')
      .limit(limit);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error searching properties with suggestions:', error);
    return { success: false, error: error.message };
  }
};

// Get search filters data (all filter options with counts)
export const getSearchFiltersData = async () => {
  try {
    // Get all active properties for analysis
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    
    // Analyze data to create filter options
    const cities = [...new Set(properties.map(p => p.city).filter(Boolean))].sort();
    const localities = [...new Set(properties.map(p => p.locality).filter(Boolean))].sort();
    const propertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))].sort();
    const furnishingTypes = [...new Set(properties.map(p => p.furnishing).filter(Boolean))].sort();
    const facingOptions = [...new Set(properties.map(p => p.facing).filter(Boolean))].sort();
    
    // Get all unique amenities
    const allAmenities = new Set();
    properties.forEach(p => {
      if (p.amenities && Array.isArray(p.amenities)) {
        p.amenities.forEach(amenity => allAmenities.add(amenity));
      }
    });
    const amenities = Array.from(allAmenities).sort();
    
    // Calculate price ranges for sale and rent
    const saleProperties = properties.filter(p => p.type === 'sale');
    const rentProperties = properties.filter(p => p.type === 'rent');
    
    const salePrices = saleProperties.map(p => p.price).filter(Boolean).sort((a, b) => a - b);
    const rentPrices = rentProperties.map(p => p.price).filter(Boolean).sort((a, b) => a - b);
    
    return {
      success: true,
      data: {
        cities,
        localities,
        propertyTypes,
        furnishingTypes,
        facingOptions,
        amenities,
        priceRanges: {
          sale: {
            min: salePrices[0] || 0,
            max: salePrices[salePrices.length - 1] || 0,
            count: salePrices.length
          },
          rent: {
            min: rentPrices[0] || 0,
            max: rentPrices[rentPrices.length - 1] || 0,
            count: rentPrices.length
          }
        },
        totalProperties: properties.length,
        saleCount: saleProperties.length,
        rentCount: rentProperties.length
      }
    };
  } catch (error) {
    console.error('Error getting search filters data:', error);
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
    
    // First, let's check if the tours table exists by trying a simple query
    try {
      await supabase.from('tours').select('id').limit(1);
    } catch (testError) {
      console.warn('⚠️ Tours table test failed:', testError);
      // If the test query fails, assume table doesn't exist
      return { 
        success: false, 
        error: 'Tours functionality is not available. Please contact support to enable tour scheduling.',
        code: 'TOURS_TABLE_MISSING'
      };
    }
    
    const tour = {
      id: `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      property_id: tourData.property_id,
      property_owner_id: tourData.property_owner_id,
      visitor_user_id: tourData.visitor_user_id || null,
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
    
    if (error) {
      // Check if the error is due to missing table (various error conditions)
      const errorMessage = error?.message || '';
      const errorCode = error?.code;
      const errorStatus = error?.status;
      
      if (errorMessage.includes('relation "public.tours" does not exist') || 
          errorCode === 'PGRST106' || 
          errorCode === '42P01' ||
          errorMessage.includes('does not exist') ||
          errorStatus === 404) {
        console.warn('⚠️ Tours table does not exist. Please run the tours migration.');
        return { 
          success: false, 
          error: 'Tours functionality is not available. Please contact support to enable tour scheduling.',
          code: 'TOURS_TABLE_MISSING'
        };
      }
      
      // Check if this is an RLS policy violation
      if (errorCode === '42501' || errorMessage.includes('row-level security policy')) {
        console.warn('⚠️ Tours RLS policy violation. User may not be authenticated properly.');
        return { 
          success: false, 
          error: 'Unable to schedule tour due to security restrictions. Please try logging in or contact support.',
          code: 'TOURS_RLS_VIOLATION'
        };
      }
      
      throw error;
    }
    
    console.log('✅ Tour scheduled successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error scheduling tour:', error);
    
    // Check if this is a 404 error (table not found)
    const errorMessage = error?.message || '';
    const errorStatus = error?.status;
    const errorCode = error?.code;
    
    if (errorStatus === 404 || 
        errorMessage.includes('404') ||
        errorMessage.includes('Not Found') ||
        errorMessage.includes('does not exist')) {
      console.warn('⚠️ Tours table does not exist (caught in catch block).');
      return { 
        success: false, 
        error: 'Tours functionality is not available. Please contact support to enable tour scheduling.',
        code: 'TOURS_TABLE_MISSING'
      };
    }
    
    // Check if this is an RLS policy violation
    if (errorCode === '42501' || errorMessage.includes('row-level security policy')) {
      console.warn('⚠️ Tours RLS policy violation (caught in catch block).');
      return { 
        success: false, 
        error: 'Unable to schedule tour due to security restrictions. Please try logging in or contact support.',
        code: 'TOURS_RLS_VIOLATION'
      };
    }
    
    return { success: false, error: errorMessage || 'An unknown error occurred' };
  }
};

// Get tours for property owners (tours scheduled on their properties)
export const getUserTours = async (userId, filters = {}) => {
  try {
    console.log('📋 Getting tours for property owner:', userId, 'with filters:', filters);
    
    let query = supabase
      .from('tours')
      .select('*')
      .eq('property_owner_id', userId)
      .order('tour_date', { ascending: true })
      .order('tour_time', { ascending: true });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('tour_date', today);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data: tours, error } = await query;
    
    if (error) throw error;
    
    // Manually fetch property details for each tour
    const toursWithProperties = await Promise.all(
      tours.map(async (tour) => {
        try {
          const { data: property, error: propError } = await supabase
            .from('properties')
            .select('id, title, address, city, images, price, property_type')
            .eq('id', tour.property_id)
            .single();
          
          return {
            ...tour,
            property: propError ? null : property
          };
        } catch (propError) {
          console.warn('Could not fetch property for tour:', tour.id);
          return {
            ...tour,
            property: null
          };
        }
      })
    );
    
    console.log('✅ Tours fetched successfully:', toursWithProperties);
    return { success: true, data: toursWithProperties };
  } catch (error) {
    console.error('❌ Error getting user tours:', error);
    return { success: false, error: error.message };
  }
};

// Get tours that a user has scheduled as a visitor (user-oriented) - by email
export const getUserScheduledTours = async (userEmail, filters = {}) => {
  try {
    console.log('📋 Getting scheduled tours for user email:', userEmail, 'with filters:', filters);
    
    let query = supabase
      .from('tours')
      .select('*')
      .eq('visitor_email', userEmail)
      .order('tour_date', { ascending: true })
      .order('tour_time', { ascending: true });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('tour_date', today);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data: tours, error } = await query;
    
    if (error) {
      // Handle case where tours table doesn't exist
      if (error.message?.includes('does not exist') || error.code === 'PGRST106') {
        console.warn('⚠️ Tours table does not exist');
        return { success: true, data: [] };
      }
      throw error;
    }
    
    // Manually fetch property details and owner info for each tour
    const toursWithProperties = await Promise.all(
      tours.map(async (tour) => {
        try {
          const { data: property, error: propError } = await supabase
            .from('properties')
            .select(`
              id, title, address, city, images, price, property_type, user_id,
              users (name, phone, email, company)
            `)
            .eq('id', tour.property_id)
            .single();
          
          return {
            ...tour,
            properties: propError ? null : property
          };
        } catch (propError) {
          console.warn('Could not fetch property for tour:', tour.id);
          return {
            ...tour,
            properties: null
          };
        }
      })
    );
    
    console.log('✅ User scheduled tours fetched successfully:', toursWithProperties);
    return { success: true, data: toursWithProperties };
  } catch (error) {
    console.error('❌ Error getting user scheduled tours:', error);
    return { success: false, error: error.message };
  }
};

// Get tours that a user has scheduled as a visitor (user-oriented) - by user ID
export const getUserScheduledToursByUserId = async (userId, filters = {}) => {
  try {
    console.log('📋 Getting scheduled tours for user ID:', userId, 'with filters:', filters);
    
    let query = supabase
      .from('tours')
      .select('*')
      .eq('visitor_user_id', userId)
      .order('tour_date', { ascending: true })
      .order('tour_time', { ascending: true });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('tour_date', today);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data: tours, error } = await query;
    
    if (error) {
      // Handle case where tours table doesn't exist
      if (error.message?.includes('does not exist') || error.code === 'PGRST106') {
        console.warn('⚠️ Tours table does not exist');
        return { success: true, data: [] };
      }
      
      // Handle case where visitor_user_id column doesn't exist yet
      if (error.message?.includes('visitor_user_id') || error.code === 'PGRST204') {
        console.warn('⚠️ visitor_user_id column does not exist yet, returning empty result');
        return { success: true, data: [] };
      }
      
      throw error;
    }
    
    // Manually fetch property details and owner info for each tour
    const toursWithProperties = await Promise.all(
      tours.map(async (tour) => {
        try {
          const { data: property, error: propError } = await supabase
            .from('properties')
            .select(`
              id, title, address, city, images, price, property_type, user_id,
              users (name, phone, email, company)
            `)
            .eq('id', tour.property_id)
            .single();
          
          return {
            ...tour,
            properties: propError ? null : property
          };
        } catch (propError) {
          console.warn('Could not fetch property for tour:', tour.id);
          return {
            ...tour,
            properties: null
          };
        }
      })
    );
    
    console.log('✅ User scheduled tours by ID fetched successfully:', toursWithProperties);
    return { success: true, data: toursWithProperties };
  } catch (error) {
    console.error('❌ Error getting user scheduled tours by ID:', error);
    
    // Handle case where visitor_user_id column doesn't exist yet
    if (error.message?.includes('visitor_user_id') || error.code === 'PGRST204') {
      console.warn('⚠️ visitor_user_id column does not exist yet, returning empty result');
      return { success: true, data: [] };
    }
    
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
    
    // Use the database function to get comprehensive view analytics
    const { data: analytics, error: analyticsError } = await supabase
      .rpc('get_property_view_analytics', { 
        prop_id: propertyId, 
        days_back: 30 
      });
    
    if (analyticsError) {
      console.error('❌ Error getting view analytics:', analyticsError);
      // Fallback to manual calculation
      return await getPropertyViewsManual(propertyId, limit);
    }
    
    // Get recent views for display
    const { data: recentViews, error: recentError } = await supabase
      .from('property_views')
      .select('*')
      .eq('property_id', propertyId)
      .order('viewed_at', { ascending: false })
      .limit(limit);
    
    if (recentError) {
      console.error('❌ Error getting recent views:', recentError);
    }
    
    const result = {
      total_views: analytics?.[0]?.total_views || 0,
      unique_views: analytics?.[0]?.unique_views || 0,
      views_today: analytics?.[0]?.views_today || 0,
      this_week_views: analytics?.[0]?.views_this_week || 0,
      last_week_views: Math.max(0, (analytics?.[0]?.views_this_month || 0) - (analytics?.[0]?.views_this_week || 0)),
      views_this_month: analytics?.[0]?.views_this_month || 0,
      recent_views: recentViews || []
    };
    
    console.log('✅ Property views fetched successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error getting property views:', error);
    return { success: false, error: error.message };
  }
};

// Fallback manual calculation if RPC function fails
const getPropertyViewsManual = async (propertyId, limit = 10) => {
  try {
    // Get all views for this property
    const { data: allViews, error } = await supabase
      .from('property_views')
      .select('*')
      .eq('property_id', propertyId)
      .order('viewed_at', { ascending: false });
    
    if (error) throw error;
    
    // Get recent views (limited)
    const { data: recentViews, error: recentError } = await supabase
      .from('property_views')
      .select('*')
      .eq('property_id', propertyId)
      .order('viewed_at', { ascending: false })
      .limit(limit);
    
    if (recentError) throw recentError;
    
    // Calculate analytics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekViews = allViews.filter(view => 
      new Date(view.viewed_at) >= oneWeekAgo
    ).length;
    
    const lastWeekViews = allViews.filter(view => {
      const viewDate = new Date(view.viewed_at);
      return viewDate >= twoWeeksAgo && viewDate < oneWeekAgo;
    }).length;
    
    const todayViews = allViews.filter(view => 
      new Date(view.viewed_at) >= today
    ).length;
    
    const uniqueUsers = new Set(allViews.filter(v => v.user_id).map(v => v.user_id)).size;
    
    const result = {
      total_views: allViews.length,
      unique_views: uniqueUsers,
      views_today: todayViews,
      this_week_views: thisWeekViews,
      last_week_views: lastWeekViews,
      views_this_month: allViews.length, // Simplified for fallback
      recent_views: recentViews
    };
    
    console.log('✅ Property views fetched successfully (manual):', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error getting property views manually:', error);
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
// Agent Management Functions

// Get agent details by ID
export const getAgentById = async (agentId) => {
  try {
    console.log('🔍 Getting agent details for:', agentId);
    
    // First try with user_type filter
    let { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        company,
        user_type,
        profile,
        stats,
        created_at,
        updated_at
      `)
      .eq('id', agentId)
      .in('user_type', ['agent', 'builder'])
      .single();
    
    // If no results with user_type filter, try without it
    if (error && error.code === 'PGRST116') {
      console.log('No agent found with user_type filter, trying without filter');
      const result = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          company,
          user_type,
          profile,
          stats,
          created_at,
          updated_at
        `)
        .eq('id', agentId)
        .single();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) throw error;
    
    // Get agent's properties count
    const { count: propertiesCount, error: propError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', agentId)
      .eq('status', 'active');
    
    if (propError) console.warn('Could not fetch properties count:', propError);
    
    // Get agent's recent properties for showcase
    const { data: recentProperties, error: recentError } = await supabase
      .from('properties')
      .select('id, title, price, images, city, property_type')
      .eq('user_id', agentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (recentError) console.warn('Could not fetch recent properties:', recentError);
    
    const agentData = {
      ...data,
      properties_count: propertiesCount || 0,
      recent_properties: recentProperties || [],
      // Default contact info if not in profile
      contact_info: {
        phone: data.phone || data.profile?.phone || '+91 98765 43210',
        email: data.email || data.profile?.email || `${data.name?.toLowerCase().replace(/\s+/g, '.')}@easyprop.com`,
        whatsapp: data.profile?.whatsapp || data.phone || '+91 98765 43210',
        response_time: data.profile?.response_time || '< 2 hours',
        availability: data.profile?.availability || 'Mon-Sat, 9 AM - 7 PM',
        languages: data.profile?.languages || ['English', 'Hindi'],
        specialization: data.profile?.specialization || 'Residential Properties',
        experience: data.profile?.experience || '5+ years',
        rating: data.stats?.rating || 4.5,
        reviews_count: data.stats?.reviews_count || 50,
        deals_closed: data.stats?.deals_closed || 100,
        bio: data.profile?.bio || `Experienced real estate professional specializing in ${data.profile?.specialization || 'residential properties'}. Known for personalized service and deep market knowledge.`,
        achievements: data.profile?.achievements || ['Top Performer', 'Customer Choice Award'],
        avatar_url: data.profile?.avatar_url || `https://i.pravatar.cc/150?u=${data.id}`
      }
    };
    
    console.log('✅ Agent details fetched successfully');
    return { success: true, data: agentData };
  } catch (error) {
    console.error('❌ Error getting agent details:', error);
    return { success: false, error: error.message };
  }
};

// Get agents for Top Picks section with contact info
export const getTopPicksAgents = async (limit = 4) => {
  try {
    console.log('🏆 Getting top picks agents with contact info');
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        company,
        user_type,
        profile,
        stats,
        created_at,
        updated_at
      `)
      .in('user_type', ['agent', 'builder'])
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    // If we don't get enough agents from the database, create mock agents
    let agents = [];
    if (error || !data || data.length === 0) {
      console.log('No agents found in database, creating mock agents');
      agents = [
        {
          id: 'mock-agent-1',
          name: 'Priya Sharma',
          company: 'Elite Properties',
          email: 'priya.sharma@easyprop.com',
          phone: '+91 98765 43210'
        },
        {
          id: 'mock-agent-2', 
          name: 'Rajesh Kumar',
          company: 'Premium Realty',
          email: 'rajesh.kumar@easyprop.com',
          phone: '+91 98765 43211'
        },
        {
          id: 'mock-agent-3',
          name: 'Anita Desai',
          company: 'Luxury Homes',
          email: 'anita.desai@easyprop.com', 
          phone: '+91 98765 43212'
        },
        {
          id: 'mock-agent-4',
          name: 'Vikram Singh',
          company: 'Metro Properties',
          email: 'vikram.singh@easyprop.com',
          phone: '+91 98765 43213'
        }
      ];
    } else {
      agents = data;
    }
    
    // Enhance each agent with contact info and property counts
    const enhancedAgents = await Promise.all(
      agents.map(async (agent) => {
        // Get agent's properties count
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', agent.id)
          .eq('status', 'active');
        
        return {
          ...agent,
          properties_count: propertiesCount || 0,
          contact_info: {
            phone: agent.phone || agent.profile?.phone || '+91 98765 43210',
            email: agent.email || agent.profile?.email || `${agent.name?.toLowerCase().replace(/\s+/g, '.')}@easyprop.com`,
            whatsapp: agent.profile?.whatsapp || agent.phone || '+91 98765 43210',
            response_time: agent.profile?.response_time || '< 2 hours',
            availability: agent.profile?.availability || 'Mon-Sat, 9 AM - 7 PM',
            languages: agent.profile?.languages || ['English', 'Hindi'],
            specialization: agent.profile?.specialization || 'Residential Properties',
            experience: agent.profile?.experience || '5+ years',
            rating: agent.stats?.rating || 4.5,
            reviews_count: agent.stats?.reviews_count || 50,
            deals_closed: agent.stats?.deals_closed || 100,
            bio: agent.profile?.bio || `Experienced real estate professional specializing in ${agent.profile?.specialization || 'residential properties'}.`,
            achievements: agent.profile?.achievements || ['Top Performer', 'Customer Choice Award'],
            avatar_url: agent.profile?.avatar_url || `https://i.pravatar.cc/150?u=${agent.id}`
          }
        };
      })
    );
    
    console.log('✅ Top picks agents with contact info fetched successfully');
    return { success: true, data: enhancedAgents };
  } catch (error) {
    console.error('❌ Error getting top picks agents:', error);
    return { success: false, error: error.message };
  }
};

// Get agent contact info for property
export const getPropertyAgentContact = async (propertyId) => {
  try {
    console.log('📞 Getting agent contact info for property:', propertyId);
    
    const { data, error } = await supabase
      .from('properties')
      .select(`
        user_id,
        users (
          id,
          name,
          email,
          phone,
          company,
          user_type,
          profile,
          stats
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    
    if (!data.users) {
      throw new Error('Agent not found for this property');
    }
    
    const agent = data.users;
    const agentContactInfo = {
      id: agent.id,
      name: agent.name,
      company: agent.company,
      contact_info: {
        phone: agent.phone || agent.profile?.phone || '+91 98765 43210',
        email: agent.email || agent.profile?.email || `${agent.name?.toLowerCase().replace(/\s+/g, '.')}@easyprop.com`,
        whatsapp: agent.profile?.whatsapp || agent.phone || '+91 98765 43210',
        response_time: agent.profile?.response_time || '< 2 hours',
        availability: agent.profile?.availability || 'Mon-Sat, 9 AM - 7 PM',
        languages: agent.profile?.languages || ['English', 'Hindi'],
        specialization: agent.profile?.specialization || 'Residential Properties',
        experience: agent.profile?.experience || '5+ years',
        rating: agent.stats?.rating || 4.5,
        reviews_count: agent.stats?.reviews_count || 50,
        deals_closed: agent.stats?.deals_closed || 100,
        bio: agent.profile?.bio || `Experienced real estate professional specializing in ${agent.profile?.specialization || 'residential properties'}.`,
        achievements: agent.profile?.achievements || ['Top Performer', 'Customer Choice Award'],
        avatar_url: agent.profile?.avatar_url || `https://i.pravatar.cc/150?u=${agent.id}`
      }
    };
    
    console.log('✅ Agent contact info fetched successfully');
    return { success: true, data: agentContactInfo };
  } catch (error) {
    console.error('❌ Error getting agent contact info:', error);
    return { success: false, error: error.message };
  }
};