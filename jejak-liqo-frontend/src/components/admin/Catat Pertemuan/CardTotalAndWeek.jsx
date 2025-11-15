import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ChartBarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const CardTotalAndWeek = ({ statistics, formatWeekRange }) => {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <ChartBarIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pertemuan Tahun {new Date().getFullYear()}</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {statistics.total_meetings || statistics.total || 0}
            </p>
          </div>
        </div>
      </div>
      
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            <CalendarDaysIcon className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Minggu Ini {formatWeekRange(statistics.week_start, statistics.week_end)}</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {statistics.this_week || statistics.thisWeek || 0}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CardTotalAndWeek;