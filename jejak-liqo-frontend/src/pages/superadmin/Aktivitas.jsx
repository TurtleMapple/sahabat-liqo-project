import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import Layout from '../../components/superadmin/Layout';
import { getActivities } from '../../api/activities';
import toast from 'react-hot-toast';
import {
  Activity,
  User,
  Shield,
  Settings,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Clock,
  Filter,
  Search,
  Calendar,
  Users
} from 'lucide-react';

const Aktivitas = () => {
  const { isDark } = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const iconMap = {
    UserPlus,
    Edit,
    Users,
    Calendar,
    LogIn,
    LogOut,
    Settings,
    UserMinus
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.type = filter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await getActivities(params);
      const activitiesWithIcons = response.data.map(activity => ({
        ...activity,
        icon: iconMap[activity.icon] || Activity,
        timestamp: new Date(activity.timestamp)
      }));
      setActivities(activitiesWithIcons);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Gagal memuat data aktivitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filter, searchTerm]);

  const filterTypes = [
    { value: 'all', label: 'Semua Aktivitas', count: activities.length },
    { value: 'user_management', label: 'Manajemen User', count: activities.filter(a => a.type === 'user_management').length },
    { value: 'settings', label: 'Pengaturan', count: activities.filter(a => a.type === 'settings').length },
    { value: 'activity', label: 'Aktivitas', count: activities.filter(a => a.type === 'activity').length }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200',
      blue: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-200',
      purple: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-200',
      red: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Layout activeMenu="Aktivitas">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <Activity size={20} className="text-blue-500" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Aktivitas Sistem
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Monitor semua aktivitas dan perubahan dalam sistem
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === type.value
                      ? 'bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white shadow-lg'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === type.value
                      ? 'bg-white/20'
                      : isDark
                        ? 'bg-gray-600'
                        : 'bg-gray-200'
                  }`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className={`rounded-2xl shadow-lg ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Riwayat Aktivitas
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`animate-pulse p-4 rounded-xl ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${
                        isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 space-y-2">
                        <div className={`h-4 w-3/4 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`h-3 w-1/2 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                      isDark
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        getColorClasses(activity.color)
                      }`}>
                        <activity.icon size={18} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {activity.action}
                            </h3>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {activity.details}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`text-xs flex items-center ${
                                isDark ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                <User size={12} className="mr-1" />
                                {activity.user}
                              </span>
                              <span className={`text-xs flex items-center ${
                                isDark ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                <Clock size={12} className="mr-1" />
                                {activity.timestamp.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity size={48} className={`mx-auto mb-4 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Tidak ada aktivitas ditemukan
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Aktivitas;