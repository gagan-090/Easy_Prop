import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProperties } from '../services/supabaseService';

const LatestSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentSales = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await getUserProperties(user.uid, { status: 'sold', limit: 4 });
      if (result.success) {
        setSales(result.data);
      } else {
        console.error("Failed to load recent sales:", result.error);
        setSales([]);
      }
      setLoading(false);
    };
    loadRecentSales();
  }, [user]);


  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)} K`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const recentSales = sales.map((property, index) => ({
      id: property.id,
      property: property.title || 'Property',
      location: `${property.city || 'City'}, ${property.state || 'State'}`,
      price: formatPrice(property.price),
      image: property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=60&h=60&fit=crop',
      color: ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500'][index % 4]
  }));


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="backdrop-blur-md bg-white/10 dark:bg-black/10 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-600/30"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Latest Sales
        </h3>
        <motion.button
          whileHover={{ scale: 1.05, x: 2 }}
          className="flex items-center text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                <div>
                  <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))
        ) : recentSales.length > 0 ? (
          recentSales.map((sale, index) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 ${sale.color} rounded-xl flex items-center justify-center overflow-hidden`}
                >
                  <img
                    src={sale.image}
                    alt={sale.property}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <Home className="h-6 w-6 text-white hidden" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {sale.property}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sale.location}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-green-500 font-bold text-sm"
              >
                {sale.price}
              </motion.div>
            </motion.div>
          ))
        ) : (
          // Empty state for new users
          <div className="text-center py-8">
            <Home className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No sales yet. Start adding properties to see your sales here.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LatestSales;
