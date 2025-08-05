// Debug utility for property addition issues
import { auth } from '../firebase';
import { addProperty } from '../services/supabaseService';
import supabase from '../services/supabaseClient.js';

export const debugPropertyAddition = async (propertyData) => {
  console.log('🔍 Debugging property addition...');
  
  // Check authentication
  const currentUser = auth.currentUser;
  console.log('👤 Current user:', currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified
  } : 'No user logged in');
  
  if (!currentUser) {
    return { success: false, error: 'No user logged in' };
  }
  
  // Check property data
  console.log('📋 Property data:', propertyData);
  
  // Validate required fields
  const requiredFields = ['title', 'price', 'area', 'address', 'city'];
  const missingFields = requiredFields.filter(field => !propertyData[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  // Test Supabase connection
  try {
    console.log('🌐 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { success: false, error: `Supabase connection failed: ${error.message}` };
    }
    
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return { success: false, error: `Supabase connection failed: ${error.message}` };
  }
  
  // Try to add property
  try {
    console.log('📝 Attempting to add property...');
    const result = await addProperty(currentUser.uid, propertyData);
    console.log('📊 Add property result:', result);
    return result;
  } catch (error) {
    console.error('❌ Property addition failed:', error);
    return { success: false, error: error.message };
  }
}; 