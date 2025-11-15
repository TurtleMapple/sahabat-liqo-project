import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import LoadingState from '../../common/LoadingState';

const TopMenteesCard = ({ topMentees, loadingTopMentees }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>5 Mentee Teraktif</h3>
      </div>
      
      {loadingTopMentees ? (
        <LoadingState type="dots" size="sm" text="Memuat mentee teraktif..." />
      ) : topMentees.length > 0 ? (
        <div className="space-y-2">
          {topMentees.map((mentee, index) => (
            <div key={mentee.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.full_name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mentee.group_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{mentee.attendance_percentage}%</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mentee.total_present}/{mentee.total_meetings}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada data mentee</p>
        </div>
      )}
    </motion.div>
  );
};

const MenteesSectionCard = ({ 
  topMentees, 
  loadingTopMentees, 
  leastActiveMentees, 
  loadingLeastActiveMentees 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* 5 Mentee Teraktif */}
      <TopMenteesCard topMentees={topMentees} loadingTopMentees={loadingTopMentees} />

      {/* 10 Mentee Kurang Aktif - Compact Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <TrendingUp className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Mentee Perlu Perhatian</h3>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
            {leastActiveMentees.length}
          </div>
        </div>
        {loadingLeastActiveMentees ? (
          <LoadingState type="dots" size="sm" text="Memuat mentee kurang aktif..." />
        ) : leastActiveMentees.length > 0 ? (
          <div className="space-y-2">
            {leastActiveMentees.map((mentee, index) => (
              <div key={mentee.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDark ? 'bg-orange-600 text-white' : 'bg-orange-200 text-orange-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.full_name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mentee.group_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{mentee.total_present}/{mentee.total_meetings}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>({mentee.attendance_percentage}%)</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Semua mentee aktif! 🎉</p>
            <p className="text-xs mt-1">Tidak ada mentee yang perlu perhatian khusus</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MenteesSectionCard;
export { TopMenteesCard };