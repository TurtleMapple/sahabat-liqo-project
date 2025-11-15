import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import LoadingState from '../../common/LoadingState';

const TopGroupsCard = ({ topGroups, loadingTopGroups }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Users className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>5 Kelompok Teraktif</h3>
      </div>
      {loadingTopGroups ? (
        <LoadingState type="dots" size="sm" text="Memuat kelompok teraktif..." />
      ) : (
        <div className="space-y-2">
          {topGroups.map((group, index) => (
            <div key={group.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{group.group_name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mentor: {group.mentor_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{group.meetings_count}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>pertemuan</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const GroupsSectionCard = ({ 
  topGroups, 
  loadingTopGroups, 
  leastActiveGroups, 
  loadingLeastActiveGroups 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* 5 Kelompok Teraktif */}
      <TopGroupsCard topGroups={topGroups} loadingTopGroups={loadingTopGroups} />

      {/* 5 Kelompok Kurang Aktif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Users className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>5 Kelompok Kurang Aktif</h3>
        </div>
        {loadingLeastActiveGroups ? (
          <LoadingState type="dots" size="sm" text="Memuat kelompok kurang aktif..." />
        ) : leastActiveGroups.length > 0 ? (
          <div className="space-y-2">
            {leastActiveGroups.map((group, index) => (
              <div key={group.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDark ? 'bg-red-600 text-white' : 'bg-red-200 text-red-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{group.group_name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mentor: {group.mentor_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{group.meetings_count}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>pertemuan</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada data</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GroupsSectionCard;
export { TopGroupsCard };