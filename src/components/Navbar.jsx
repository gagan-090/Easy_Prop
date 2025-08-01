import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-slate-900">Estately</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/properties?type=apartment" className="nav-link">
              Apartments
            </Link>
            <Link to="/properties?type=villa" className="nav-link">
              Villas
            </Link>
            <Link to="/properties?type=commercial" className="nav-link">
              Commercial
            </Link>
            <div className="relative group">
              <button className="nav-link flex items-center space-x-1">
                <span>For rent</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Currency Selector */}
            <div className="relative">
              <button className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:border-gray-300 transition-colors">
                <span>INR</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="btn-ghost">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 p-1"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-ghost">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100">
          <div className="px-6 py-4 space-y-3 bg-white">
            <Link to="/properties?type=apartment" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
              Apartments
            </Link>
            <Link to="/properties?type=villa" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
              Villas
            </Link>
            <Link to="/properties?type=commercial" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
              Commercial
            </Link>
            <Link to="/about" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
              About
            </Link>
            <Link to="/contact" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
              Contact
            </Link>
            
            <div className="border-t border-gray-100 pt-3 mt-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
                    Dashboard
                  </Link>
                  <div className="py-2 text-sm text-slate-500">
                    Welcome, {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-slate-600 hover:text-slate-900 font-medium">
                    Log in
                  </Link>
                  <Link to="/register" className="block py-2 text-slate-900 hover:text-slate-700 font-medium">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;