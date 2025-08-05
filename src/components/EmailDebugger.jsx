import React, { useState } from 'react';
import { sendOTPEmail, testEmailJSConnection } from '../services/emailService';

const EmailDebugger = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const otp = '123456'; // Test OTP
      const response = await sendOTPEmail(email, otp, 'Test User');
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await testEmailJSConnection();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Email OTP Debugger</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleTestEmail}
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Test OTP'}
          </button>
          
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-medium">Result:</h3>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Open browser console (F12)</li>
            <li>Enter your email address</li>
            <li>Click "Send Test OTP"</li>
            <li>Check console for detailed logs</li>
            <li>Check your email inbox and spam folder</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmailDebugger;