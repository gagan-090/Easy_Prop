import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const FirebaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const { checkFirebaseConnection } = useAuth();

  const testConnection = async () => {
    setTesting(true);
    try {
      const result = await checkFirebaseConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        connected: false,
        error: error.message,
        message: 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    if (testing) {
      return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />;
    }
    
    if (!connectionStatus) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
    
    if (connectionStatus.success && connectionStatus.connected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (testing) return 'border-blue-200 bg-blue-50';
    if (!connectionStatus) return 'border-gray-200 bg-gray-50';
    if (connectionStatus.success && connectionStatus.connected) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  const getStatusText = () => {
    if (testing) return 'Testing connection...';
    if (!connectionStatus) return 'Connection status unknown';
    if (connectionStatus.success && connectionStatus.connected) return 'Firebase connected successfully';
    return connectionStatus.message || 'Connection failed';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()} transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {connectionStatus?.connected ? (
            <Wifi className="h-6 w-6 text-green-600" />
          ) : (
            <WifiOff className="h-6 w-6 text-red-600" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">Firebase Connection</h3>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusIcon()}
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={testConnection}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {testing ? 'Testing...' : 'Test Again'}
        </button>
      </div>
      
      {connectionStatus && !connectionStatus.success && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error Details:</p>
          <p className="text-sm text-red-600 mt-1">{connectionStatus.error}</p>
        </div>
      )}
      
      {connectionStatus && connectionStatus.success && connectionStatus.user && (
        <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">User Info:</p>
          <p className="text-sm text-green-600 mt-1">
            UID: {connectionStatus.user.uid}<br />
            Email: {connectionStatus.user.email || 'Not provided'}<br />
            Phone: {connectionStatus.user.phoneNumber || 'Not provided'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FirebaseConnectionTest;