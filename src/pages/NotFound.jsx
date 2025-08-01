import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Home className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center btn-primary"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Or try these popular pages:</p>
              <div className="mt-2 space-x-4">
                <Link to="/properties" className="text-primary-600 hover:text-primary-500">
                  Properties
                </Link>
                <Link to="/about" className="text-primary-600 hover:text-primary-500">
                  About Us
                </Link>
                <Link to="/contact" className="text-primary-600 hover:text-primary-500">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;