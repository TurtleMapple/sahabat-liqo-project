import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Clock, CheckCircle, Archive } from 'lucide-react';

const StatusBadge = ({ eventAt }) => {
  const { isDark } = useTheme();

  const getStatusConfig = () => {
    const now = new Date();
    const eventDate = new Date(eventAt);
    
    // Compare full datetime (date + time)
    if (eventDate > now) {
      return {
        status: 'scheduled',
        label: 'Terjadwal',
        icon: Clock,
        className: isDark 
          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
      };
    } else {
      // If event time has passed, it's active (not expired)
      // Announcements don't expire automatically
      return {
        status: 'active',
        label: 'Aktif',
        icon: CheckCircle,
        className: isDark 
          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
          : 'bg-green-50 text-green-700 border-green-200'
      };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default StatusBadge;