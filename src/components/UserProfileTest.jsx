import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfileTest = () => {
  const { user, ensureUserProfile, refreshUserData } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testUserProfile = async () => {
    if (!user) {
      setTestResult({ success: false, error: 'No user logged in' });
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Testing user profile for:', user.uid);
      
      const result = await ensureUserProfile(user);
      setTestResult(result);
      
      if (result.success) {
        console.log('✅ User profile test successful:', result.data);
      } else {
        console.error('❌ User profile test failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error during user profile test:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      await refreshUserData();
      setTestResult({ success: true, message: 'User data refreshed successfully' });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">User Profile Test</h2>
      
      {user ? (
        <div className="space-y-4">
          <div className="text-sm">
            <p><strong>User ID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>User Type:</strong> {user.userType}</p>
            <p><strong>Company:</strong> {user.company || 'None'}</p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={testUserProfile}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test User Profile'}
            </button>
            
            <button
              onClick={refreshUser}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh User Data'}
            </button>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded ${
              testResult.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">
                {testResult.success ? '✅ Success' : '❌ Error'}
              </p>
              <p className="text-sm">
                {testResult.message || testResult.error || 'Test completed'}
              </p>
              {testResult.data && (
                <div className="mt-2 text-xs">
                  <p><strong>User Type:</strong> {testResult.data.user_type}</p>
                  <p><strong>Company:</strong> {testResult.data.company || 'None'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Please log in to test user profile functionality.</p>
      )}
    </div>
  );
};

export default UserProfileTest; 