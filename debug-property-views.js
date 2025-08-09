// Debug script to test property view functionality
import { addPropertyView, getPropertyViews } from './src/services/supabaseService.js';

const testPropertyViews = async () => {
  console.log('🧪 Testing property view functionality...');
  
  // Test with a sample property ID (replace with actual property ID)
  const testPropertyId = 'test-property-id';
  const testUserId = 'test-user-id';
  
  try {
    // Test adding a view
    console.log('📝 Adding property view...');
    const addResult = await addPropertyView(testPropertyId, testUserId);
    console.log('Add view result:', addResult);
    
    // Test getting views
    console.log('📊 Getting property views...');
    const getResult = await getPropertyViews(testPropertyId);
    console.log('Get views result:', getResult);
    
    // Test anonymous view
    console.log('👤 Adding anonymous view...');
    const anonymousResult = await addPropertyView(testPropertyId, null);
    console.log('Anonymous view result:', anonymousResult);
    
    // Get updated views
    console.log('📊 Getting updated views...');
    const updatedResult = await getPropertyViews(testPropertyId);
    console.log('Updated views result:', updatedResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Uncomment to run the test
// testPropertyViews();

export default testPropertyViews;