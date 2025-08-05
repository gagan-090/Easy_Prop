import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  Home,
  Building,
  Building2,
  Briefcase,
  Info,
  Phone,
  Sparkles,
  Globe
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for styling
      setScrolled(currentScrollY > 20);
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top - show navbar
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold - hide navbar
        setIsVisible(false);
        setDropdownOpen(false); // Close dropdown when hiding
        setIsOpen(false); // Close mobile menu when hiding
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Apartments', path: '/properties?type=apartment', icon: Building },
    { name: 'Villas', path: '/properties?type=villa', icon: Home },
    { name: 'Commercial', path: '/properties?type=commercial', icon: Briefcase },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone }
  ];

  const rentOptions = [
    { name: 'Residential Rent', path: '/properties?category=rent&type=residential' },
    { name: 'Commercial Rent', path: '/properties?category=rent&type=commercial' },
    { name: 'Short Term Rent', path: '/properties?category=rent&type=short-term' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut",
        type: "tween"
      }}
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-2xl bg-white/85 dark:bg-gray-900/85 shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-500/25 border border-white/30 dark:border-gray-700/40 rounded-[2.5rem]'
          : 'backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 shadow-xl shadow-cyan-500/10 dark:shadow-cyan-500/15 border border-white/20 dark:border-gray-700/30 rounded-[2.5rem]'
      }`}
    >
      {/* Enhanced Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-pink-500/8 opacity-60 rounded-[2.5rem]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-50/20 dark:from-gray-800/40 dark:to-blue-900/20 rounded-[2.5rem]"></div>
      
      <div className="w-full px-6 relative">
        <div className="flex justify-between items-center h-16">

          {/* Enhanced Logo */}
          <motion.div

            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:shadow-blue-500/25"
              >
                <Sparkles className="h-7 w-7 text-white" />
              </motion.div>
              <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
                EasyProp
              </span>
            </Link>
          </motion.div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">

            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Link
                  to={item.path}
                  className={`relative px-3 py-2 rounded-xl transition-all duration-500 flex items-center space-x-2 ${
                    location.pathname === item.path || location.search.includes(item.path.split('?')[1])
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'

                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  } group-hover:bg-white/60 dark:group-hover:bg-gray-800/60 group-hover:shadow-2xl group-hover:border group-hover:border-blue-200/50 dark:group-hover:border-blue-700/50`}
                >
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-500"
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  <span className="font-semibold text-base">{item.name}</span>

                  
                  {/* Enhanced Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                    whileHover={{ scale: 1.05 }}
                  />
                  
                  {/* Enhanced Active Indicator */}
                  {(location.pathname === item.path || location.search.includes(item.path.split('?')[1])) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
            
            {/* Enhanced For Rent Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative group"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="relative px-4 py-3 rounded-2xl transition-all duration-500 flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group-hover:bg-white/60 dark:group-hover:bg-gray-800/60 group-hover:shadow-2xl group-hover:border group-hover:border-blue-200/50 dark:group-hover:border-blue-700/50"
              >

                <motion.div
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-500"
                >
                  <Building2 className="h-5 w-5" />
                </motion.div>
                <span className="font-semibold text-base">For Rent</span>

                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
                
                {/* Enhanced Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                  whileHover={{ scale: 1.05 }}
                />
              </motion.button>
              
              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-4 w-64 backdrop-blur-2xl bg-white/95 dark:bg-gray-800/95 rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-gray-700/50 overflow-hidden"
                  >
                    {rentOptions.map((option, index) => (
                      <motion.div
                        key={option.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 8, scale: 1.02 }}
                        className="group"
                      >
                        <Link
                          to={option.path}
                          className="block px-6 py-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/30 transition-all duration-300 font-medium group-hover:shadow-lg group-hover:border-l-4 group-hover:border-l-blue-500"
                        >
                          {option.name}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Enhanced Right Side */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Enhanced Currency Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="relative"
              whileHover={{ y: -2 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-500 shadow-xl hover:shadow-2xl"
              >
                <Globe className="h-4 w-4" />
                <span>INR</span>
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center space-x-2"
              >
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 backdrop-blur-xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/40 text-blue-600 dark:text-blue-400 rounded-2xl font-semibold hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-500 shadow-xl hover:shadow-2xl"
                  >
                    Dashboard
                  </Link>
                </motion.div>

                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex-shrink flex items-center space-x-2 px-4 py-2 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 rounded-2xl shadow-xl"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <User className="h-4 w-4 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate min-w-0">
                    {user?.name}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </motion.button>
                </motion.div>

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center space-x-2"
              >
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-4 py-2 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-500 shadow-xl hover:shadow-2xl"
                  >
                    Log in
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-500 shadow-xl hover:shadow-2xl"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </motion.div>

            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="lg:hidden z-10">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-4 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-500 shadow-xl"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:hidden border-t border-white/30 dark:border-gray-700/40 backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 rounded-b-[2.5rem]"
          >
            <div className="px-8 py-8 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-4 py-4 px-6 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-500 font-semibold shadow-xl"
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-lg">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Enhanced Mobile Rent Options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-4 py-4 px-6 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold shadow-xl">
                  <Building2 className="h-6 w-6" />
                  <span className="text-lg">For Rent</span>
                </div>
                {rentOptions.map((option, index) => (
                  <motion.div
                    key={option.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      to={option.path}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-10 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium"
                    >
                      {option.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="border-t border-white/30 dark:border-gray-700/40 pt-6 mt-6 space-y-4"
              >
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-4 py-4 px-6 bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/40 text-blue-600 dark:text-blue-400 rounded-2xl font-semibold shadow-xl"
                    >
                      <User className="h-6 w-6" />
                      <span className="text-lg">Dashboard</span>
                    </Link>
                    <div className="flex items-center space-x-4 py-4 px-6 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 rounded-2xl shadow-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Welcome, {user?.name}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="flex items-center space-x-4 w-full py-4 px-6 backdrop-blur-xl bg-red-500/30 border border-red-500/40 text-red-600 dark:text-red-400 rounded-2xl font-semibold hover:bg-red-500/40 transition-all duration-500 shadow-xl"
                    >
                      <LogOut className="h-6 w-6" />
                      <span className="text-lg">Logout</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center py-4 px-6 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/40 dark:border-gray-600/40 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-500 shadow-xl"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-500 shadow-xl"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
