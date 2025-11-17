import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { getProfile } from '../../api/profile';
import { getAnnouncements } from '../../api/announcements';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TrendingUp,
  FileText,
  UsersRound,
  GraduationCap,
  Users,
  Megaphone,
  Calendar,
  User
} from 'lucide-react';
import Layout from '../../components/superadmin/Layout';

// Get trend status from change value
const getTrendStatus = (change) => {
  if (!change || change === '0') return 'neutral';
  if (change.startsWith('+')) return 'up';
  if (change.startsWith('-')) return 'down';
  return 'neutral';
};

// Stats configuration using backend comparison data
const getStatsConfig = (data) => [
  { 
    id: 1, 
    title: 'Total Mentee', 
    value: data?.totals?.totalMentee || '0', 
    icon: GraduationCap, 
    color: 'from-blue-500 to-cyan-400', 
    change: `+${data?.additions?.totalMentee || '0'}`,
    trendStatus: 'up'
  },
  { 
    id: 2, 
    title: 'Total Laporan', 
    value: data?.totals?.totalLaporan || '0', 
    icon: FileText, 
    color: 'from-purple-500 to-pink-400', 
    change: `+${data?.additions?.totalLaporan || '0'}`,
    trendStatus: 'up',
    subtitle: '(Minggu Ini)' 
  },
  { 
    id: 3, 
    title: 'Total Admin', 
    value: data?.totals?.totalAdmin || '0', 
    icon: Users, 
    color: 'from-green-500 to-emerald-400', 
    change: `+${data?.additions?.totalAdmin || '0'}`,
    trendStatus: 'up'
  },
  { 
    id: 4, 
    title: 'Total Mentor', 
    value: data?.totals?.totalMentor || '0', 
    icon: UsersRound, 
    color: 'from-orange-500 to-amber-400', 
    change: `+${data?.additions?.totalMentor || '0'}`,
    trendStatus: 'up'
  }
];







// Stats Card Component
const StatsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration : 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`rounded-2xl shadow-md hover:shadow-xl transition-all p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
          {stat.subtitle && (
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.subtitle}</p>
          )}
          <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{stat.value}</h3>
          <span className={`inline-flex items-center text-sm font-semibold ${
            stat.trendStatus === 'up' 
              ? 'text-green-600' 
              : stat.trendStatus === 'down'
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            <TrendingUp 
              size={16} 
              className={`mr-1 ${
                stat.trendStatus === 'up' ? 'rotate-0' 
                : stat.trendStatus === 'down' ? 'rotate-180'
                : 'rotate-90'
              }`} 
            />
            {stat.change}
          </span>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Welcome Card Component
const WelcomeCard = ({ userData }) => {
  const { isDark } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? 'Selamat pagi' : currentHour < 17 ? 'Selamat siang' : 'Selamat malam';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl shadow-2xl p-8 mb-6 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700' 
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100 border border-blue-200'
      }`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <div className={`w-full h-full rounded-full ${
          isDark ? 'bg-gradient-to-br from-blue-400 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-[#4DABFF] to-blue-600'
            }`}>
              {userData?.profile?.profile_picture ? (
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL}/storage/${userData.profile.profile_picture}`}
                  alt="Profile"
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {userData?.profile?.full_name ? userData.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SA'}
                </span>
              )}
            </div>
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {greeting}, {userData?.profile?.nickname || userData?.profile?.full_name?.split(' ')[0] || 'Super Admin'}! 👋
              </h2>
              <p className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Semoga harimu produktif dan penuh berkah 💪
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`flex items-center px-4 py-2 rounded-xl ${
              isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-100 border border-blue-200'
            }`}>
              <div className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
                isDark ? 'bg-green-400' : 'bg-green-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                isDark ? 'text-green-400' : 'text-green-700'
              }`}>Online</span>
            </div>
            
            <div className={`flex items-center px-4 py-2 rounded-xl ${
              isDark ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-100 border border-purple-200'
            }`}>
              <span className={`text-sm font-medium ${
                isDark ? 'text-purple-400' : 'text-purple-700'
              }`}>Super Administrator</span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block">
          <div className={`text-right ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="text-sm font-medium">{currentTime.toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-lg mt-1 ${
              isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-white/70 border border-gray-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                isDark ? 'bg-blue-400' : 'bg-blue-500'
              }`}></div>
              <span className="text-lg font-mono font-bold tabular-nums">
                {currentTime.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit', 
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Announcements Card Component
const AnnouncementsCard = ({ announcements, loading }) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-2xl shadow-md p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        <Megaphone size={24} className="mr-2 text-[#4DABFF]" />
        Pengumuman Terbaru
      </h3>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`animate-pulse p-4 rounded-xl ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className={`h-4 w-3/4 rounded mb-2 ${
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
              <div className={`h-3 w-1/2 rounded ${
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
            </div>
          ))
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-xl transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <h4 className={`font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {announcement.title}
              </h4>
              {announcement.content && (
                <p className={`text-sm mb-3 line-clamp-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {announcement.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className={`flex items-center text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Calendar size={12} className="mr-1" />
                  {new Date(announcement.created_at).toLocaleDateString('id-ID')}
                </div>
                <div className={`flex items-center text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <User size={12} className="mr-1" />
                  {announcement.author?.profile?.full_name || announcement.author?.email || 'Admin'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Megaphone size={32} className="mx-auto mb-2 opacity-50" />
            <p>Belum ada pengumuman</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Recent Admins Table Component
const RecentAdminsTable = ({ recentAdmins, loading }) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-2xl shadow-md p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        <Users size={24} className="mr-2 text-[#4DABFF]" />
        Admin Terbaru
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <th className={`text-left py-3 px-2 text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Nama</th>
              <th className={`text-left py-3 px-2 text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Email</th>
              <th className={`text-left py-3 px-2 text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className={`border-b last:border-0 ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full animate-pulse ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-4 w-24 rounded animate-pulse ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`h-4 w-32 rounded animate-pulse ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`h-4 w-20 rounded animate-pulse ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </td>
                </tr>
              ))
            ) : recentAdmins.length > 0 ? (
              recentAdmins.map((admin, index) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(77, 171, 255, 0.05)' }}
                  className={`border-b last:border-0 ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  }`}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      {admin.profile_picture ? (
                        <img 
                          src={admin.profile_picture} 
                          alt={admin.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <span className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>{admin.name}</span>
                    </div>
                  </td>
                  <td className={`py-4 px-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{admin.email}</td>
                  <td className={`py-4 px-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{admin.joinDate}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={`py-8 text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Belum ada admin terbaru
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [statsData, setStatsData] = useState([]);
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const { isDark } = useTheme();

  // Fetch dashboard statistics with comparison
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats-comparison');
        const data = response.data.data;
        
        setStatsData(getStatsConfig(data));
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Gagal memuat statistik dashboard');
        // Use default values on error
        setStatsData(getStatsConfig({}));
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentAdmins = async () => {
      try {
        const response = await api.get('/admins?per_page=5&sort=created_at&order=desc');
        if (response.data.status === 'success') {
          const admins = response.data.data.data.map(admin => ({
            id: admin.id,
            name: admin.profile?.full_name || admin.email,
            email: admin.email,
            profile_picture: admin.profile?.profile_picture ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${admin.profile.profile_picture}` : null,
            joinDate: new Date(admin.created_at).toLocaleDateString('id-ID')
          }));
          setRecentAdmins(admins);
        }
      } catch (error) {
        console.error('Failed to fetch recent admins:', error);
        toast.error('Gagal memuat data admin terbaru');
      } finally {
        setLoadingAdmins(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await getProfile();
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const response = await getAnnouncements({ per_page: 4, sort: 'created_at', order: 'desc' });
        if (response.status === 'success') {
          setAnnouncements(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        toast.error('Gagal memuat pengumuman');
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchStats();
    fetchRecentAdmins();
    fetchUserData();
    fetchAnnouncements();
  }, []);

  return (
    <Layout activeMenu="Dashboard">
      <div className="p-4 md:p-6 lg:p-8">
        <WelcomeCard userData={userData} />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`rounded-2xl shadow-md p-6 animate-pulse ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`h-4 rounded mb-2 w-24 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-8 rounded mb-2 w-16 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-4 rounded w-12 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <div className={`w-14 h-14 rounded-xl ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`}></div>
                </div>
              </div>
            ))
          ) : (
            statsData.map((stat, index) => (
              <StatsCard key={stat.id} stat={stat} index={index} />
            ))
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnnouncementsCard announcements={announcements} loading={loadingAnnouncements} />
          <RecentAdminsTable recentAdmins={recentAdmins} loading={loadingAdmins} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;