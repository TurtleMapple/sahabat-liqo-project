import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Megaphone, CheckCircle, Clock, Archive } from 'lucide-react';

const AnnouncementStats = ({ stats }) => {
  const { isDark } = useTheme();

  const statsConfig = [
    {
      key: 'total',
      label: 'Total Pengumuman',
      icon: Megaphone,
      color: 'blue',
      value: stats?.total || 0
    },
    {
      key: 'active',
      label: 'Aktif Hari Ini',
      icon: CheckCircle,
      color: 'green',
      value: stats?.active || 0
    },
    {
      key: 'scheduled',
      label: 'Terjadwal',
      icon: Clock,
      color: 'yellow',
      value: stats?.scheduled || 0
    },
    {
      key: 'expired',
      label: 'Berakhir',
      icon: Archive,
      color: 'red',
      value: stats?.expired || 0
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600',
      green: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600',
      yellow: isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
      red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
    };
    return colors[color];
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AnnouncementStats;