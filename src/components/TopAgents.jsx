import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Star } from 'lucide-react';

const TopAgents = () => {
  const agents = [
    {
      id: 1,
      name: 'Benny Chagur',
      role: 'Top Agent',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rating: 4.9,
      deals: 23
    },
    {
      id: 2,
      name: 'Chynita Heree',
      role: 'Top Agent',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      rating: 4.8,
      deals: 19
    },
    {
      id: 3,
      name: 'David Yers',
      role: 'Top Agent',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      rating: 4.7,
      deals: 17
    },
    {
      id: 4,
      name: 'Benny Chagur',
      role: 'Top Agent',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      rating: 4.6,
      deals: 15
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Agent
        </h3>
        <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={agent.avatar}
                alt={agent.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {agent.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {agent.role}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {agent.rating}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({agent.deals} deals)
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
        ))}
      </div>
    </motion.div>
  );
};

export default TopAgents;