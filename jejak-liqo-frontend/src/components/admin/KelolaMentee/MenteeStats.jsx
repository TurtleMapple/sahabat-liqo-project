import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const MenteeStats = ({ genderStats }) => {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
            <Users className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
          </div>
          <div className="ml-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Mentee</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {genderStats.totalIkhwan + genderStats.totalAkhwat} / {genderStats.activeIkhwan + genderStats.activeAkhwat}
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
          <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
            <Users className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={24} />
          </div>
          <div className="ml-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Ikhwan</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {genderStats.totalIkhwan} / {genderStats.activeIkhwan}
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
          <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
            <Users className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
          </div>
          <div className="ml-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Akhwat</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {genderStats.totalAkhwat} / {genderStats.activeAkhwat}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MenteeStats;