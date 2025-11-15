import React from 'react';
import { motion } from 'framer-motion';
import { UserCog } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import LoadingState from '../../common/LoadingState';

const TopMentorsCard = ({ topMentors, loadingTopMentors }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <UserCog className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>5 Mentor Teraktif</h3>
      </div>
      {loadingTopMentors ? (
        <LoadingState type="dots" size="sm" text="Memuat mentor teraktif..." />
      ) : (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => {
            const mentor = topMentors && topMentors[index];
            return (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                      : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {mentor ? mentor.mentor_name : '-'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {mentor ? mentor.group_name : '-'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {mentor ? mentor.meetings_count : 0}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>pertemuan</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

const MentorsSectionCard = ({ 
  topMentors, 
  loadingTopMentors, 
  leastActiveMentors, 
  loadingLeastActiveMentors 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* 5 Mentor Teraktif */}
      <TopMentorsCard topMentors={topMentors} loadingTopMentors={loadingTopMentors} />

      {/* 5 Mentor Kurang Aktif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="flex items-center space-x-2 mb-4">
          <UserCog className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>5 Mentor Kurang Aktif</h3>
        </div>
        {loadingLeastActiveMentors ? (
          <LoadingState type="dots" size="sm" text="Memuat mentor Kurang aktif..." />
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => {
              const mentor = leastActiveMentors && leastActiveMentors[index];
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDark ? 'bg-red-600 text-white' : 'bg-red-200 text-red-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mentor ? mentor.mentor_name : '-'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {mentor ? mentor.group_name : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {mentor ? mentor.meetings_count : 0}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pertemuan</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MentorsSectionCard;
export { TopMentorsCard };