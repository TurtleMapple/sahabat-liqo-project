import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserIcon, UsersIcon } from '@heroicons/react/24/solid';

const CardTotalKelompok = ({ stats }) => {
  const { isDark } = useTheme();

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
            <UsersIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="ml-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Kelompok</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {stats.total_groups || 0}
            </p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
            <UserIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="ml-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kelompok Ikhwan</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {stats.ikhwan_groups || 0}
            </p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-pink-900/20' : 'bg-pink-100'}`}>
            <UserIcon className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
          </div>
          <div className="ml-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kelompok Akhwat</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {stats.akhwat_groups || 0}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CardTotalKelompok;