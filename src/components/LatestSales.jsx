import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const LatestSales = () => {
  const sales = [
    {
      id: 1,
      property: 'Metro Jayakar Apartment',
      location: 'North Carolina, USA',
      price: '+₹35',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=60&h=60&fit=crop',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      property: 'Letdo Ji Hotel & Apartment',
      location: 'Carolina North, UK',
      price: '+₹40',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&h=60&fit=crop',
      color: 'bg-red-500'
    },
    {
      id: 3,
      property: 'Star Sun Hotel & Apartment',
      location: 'North Carolina, USA',
      price: '+₹50',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&h=60&fit=crop',
      color: 'bg-blue-400'
    },
    {
      id: 4,
      property: 'Metro Jayakar Apartment',
      location: 'North Carolina, USA',
      price: '+₹45',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=60&h=60&fit=crop',
      color: 'bg-gray-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
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
        {sales.map((sale, index) => (
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
                />
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
        ))}
      </div>
    </motion.div>
  );
};

export default LatestSales;