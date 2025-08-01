import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink, 
  Settings,
  Palette,
  Layout,
  Globe,
  Share2
} from 'lucide-react';

const WebsitePreview = () => {
  const [viewMode, setViewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('preview');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const viewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' }
  ];

  const tabs = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'customize', label: 'Customize', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Website Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Preview and customize your property website
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit Live Site</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {activeTab === 'preview' && (
        <motion.div variants={itemVariants} className="space-y-6">
          {/* View Mode Selector */}
          <div className="flex items-center justify-center space-x-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
            {viewModes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === mode.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <mode.icon className="h-4 w-4" />
                <span>{mode.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Preview Frame */}
          <div className="flex justify-center">
            <motion.div
              animate={{ width: viewModes.find(m => m.id === viewMode)?.width }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              style={{ maxWidth: '100%', height: '600px' }}
            >
              <div className="h-8 bg-gray-100 dark:bg-gray-700 flex items-center px-4 space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-white dark:bg-gray-600 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-300 inline-block">
                    yoursite.easyprop.com
                  </div>
                </div>
              </div>
              
              <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    EasyProp Properties
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Find your dream property with us
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Property {i}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">$250,000</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {activeTab === 'customize' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customization Options */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Theme Colors
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex space-x-2">
                    {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} border-2 border-white shadow-sm hover:scale-110 transition-transform`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Layout Style
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option>Modern Grid</option>
                    <option>Classic List</option>
                    <option>Card Layout</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    defaultValue="EasyProp Properties"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Find your dream property with us"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-8 bg-gray-100 dark:bg-gray-700 flex items-center px-4">
                <div className="text-xs text-gray-600 dark:text-gray-300">Live Preview</div>
              </div>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    EasyProp Properties
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Find your dream property with us
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                        <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Property {i}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">$250,000</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div variants={itemVariants} className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Website Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Domain
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="yoursite.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Connect
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Currently using: yoursite.easyprop.com
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable contact forms</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show property search</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Display agent information</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WebsitePreview;