import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import { 
  Home, 
  Plus, 
  List, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  User,
  Eye,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Activity,
  PieChart,
  CheckCircle,
  Calendar
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('🏠 DashboardLayout - User data:', user);
  console.log('🏠 DashboardLayout - User type:', user?.userType);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: location.pathname === '/dashboard' },
    { name: 'Add Property', href: '/dashboard/add-property', icon: Plus, current: location.pathname === '/dashboard/add-property' },
    { name: 'My Properties', href: '/dashboard/my-properties', icon: List, current: location.pathname === '/dashboard/my-properties' },
    { name: 'Sold', href: '/dashboard/sold', icon: CheckCircle, current: location.pathname === '/dashboard/sold' },
    { name: 'Website Preview', href: '/dashboard/website-preview', icon: Eye, current: location.pathname === '/dashboard/website-preview' },
    { name: 'Leads & Inquiries', href: '/dashboard/leads', icon: MessageSquare, current: location.pathname === '/dashboard/leads' },
    { name: 'Tours', href: '/dashboard/tours', icon: Calendar, current: location.pathname === '/dashboard/tours' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart, current: location.pathname === '/dashboard/analytics' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: location.pathname === '/dashboard/settings' },
  ];

  const notifications = [
    { id: 1, message: 'New inquiry for Modern Villa', time: '2 min ago', unread: true },
    { id: 2, message: 'Property approved by admin', time: '1 hour ago', unread: true },
    { id: 3, message: 'Weekly analytics report ready', time: '2 hours ago', unread: false },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-2xl"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      EasyProp
                    </span>
                  </motion.div>
                </div>
                <nav className="mt-8 px-2 space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className={`${
                          item.current
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        } group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={`${
                            item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                          } mr-3 flex-shrink-0 h-5 w-5`}
                        />
                        {item.name}
                        {item.current && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute right-2 w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
              
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ProfilePhotoUpload 
                      currentPhotoUrl={user?.photoURL}
                      size="small"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name || 'John Doe'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'gaganshuklarmg@gmail.com'}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                      {user?.userType || 'Agent'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700"
        >
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EasyProp
                </span>
              </motion.div>
            </div>
            
            <nav className="mt-8 flex-1 px-4 space-y-2">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.href}
                    className={`${
                      item.current
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                    {item.current && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-3 w-2 h-2 bg-white rounded-full"
                      />
                    )}
                    {!item.current && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={false}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          
          {/* User card at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-3"
            >
              <div className="flex-shrink-0">
                <ProfilePhotoUpload 
                  currentPhotoUrl={user?.photoURL}
                  size="medium"
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user?.name || 'John Doe'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'gaganshuklarmg@gmail.com'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                  {user?.userType || 'Agent'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1">
        {/* Top Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4 ml-auto">
                {/* Theme toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.button>

                {/* Language switcher */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    />
                  </motion.button>

                  <AnimatePresence>
                    {notificationDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <div className="flex items-start">
                                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ProfilePhotoUpload 
                      currentPhotoUrl={user?.photoURL}
                      size="small"
                    />
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'John Doe'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'gaganshuklarmg@gmail.com'}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                            {user?.userType || 'Agent'}
                          </p>
                        </div>
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.header>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;