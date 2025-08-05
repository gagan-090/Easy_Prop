import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Star, User } from 'lucide-react';
import { getTopSellers } from '../services/supabaseService';

const TopAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopAgents = async () => {
      setLoading(true);
      const result = await getTopSellers(3); // Fetch top 3 agents
      if (result.success) {
        setAgents(result.data);
      } else {
        console.error("Failed to load top agents:", result.error);
      }
      setLoading(false);
    };

    loadTopAgents();
  }, []);

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="backdrop-blur-md bg-white/10 dark:bg-black/10 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-600/30"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Agents
        </h3>
        <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
          View All
        </button>
      </div>

      
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="w-20 h-3 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))
        ) : agents.length > 0 ? (
          agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                >
                  <img
                    src={agent.profile?.avatar_url || `https://i.pravatar.cc/40?u=${agent.id}`}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {agent.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.company || 'Top Agent'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {agent.stats?.rating || 4.8}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({agent.stats?.totalProperties || 0} properties)
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </motion.div>
          ))
        ) : (
          // Empty state for new users
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Top agents will appear here.
            </p>
          </div>

        )}
      </div>
    </motion.div>
  );
};

export default TopAgents;
