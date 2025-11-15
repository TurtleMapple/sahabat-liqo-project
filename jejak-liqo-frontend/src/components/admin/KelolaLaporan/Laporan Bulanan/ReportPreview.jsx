import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../contexts/ThemeContext';
import { FileText, Users, Calendar, TrendingUp } from 'lucide-react';
import LoadingState from '../../../common/LoadingState';

const ReportPreview = ({ reportData, loading }) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg h-fit`}
      >
        <div className="flex items-center space-x-2 mb-6">
          <FileText className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Preview Laporan
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingState type="spinner" size="lg" text="Memuat preview laporan..." />
        </div>
      </motion.div>
    );
  }

  if (!reportData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg h-fit`}
      >
        <div className="flex items-center space-x-2 mb-6">
          <FileText className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Preview Laporan
          </h3>
        </div>
        <div className="text-center py-12">
          <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'} opacity-50`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Klik "Preview Laporan" untuk melihat hasil
          </p>
        </div>
      </motion.div>
    );
  }

  const { summary, data } = reportData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center space-x-2 mb-6">
        <FileText className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Preview Laporan
        </h3>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Ringkasan Laporan
        </h4>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {summary?.period}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={16} className={isDark ? 'text-green-400' : 'text-green-600'} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {summary?.total_groups} Kelompok
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {summary?.total_meetings} Pertemuan
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {summary?.attendance_rate}% Kehadiran
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Preview */}
      <div>
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Detail Kelompok ({data?.length || 0})
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data?.map((group, index) => (
            <div
              key={group.group_id}
              className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {group.group_name}
                </h5>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  group.group_type === 'Laporan Kelompok Ikhwan'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : group.group_type === 'Laporan Kelompok Akhwat'
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {group.group_type?.replace('Laporan Kelompok ', '')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Mentor: {group.mentor_name}
                </span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {group.meetings?.length || 0} pertemuan, {group.mentees?.length || 0} mentee
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportPreview;