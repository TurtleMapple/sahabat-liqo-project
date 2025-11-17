import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/admin/Layout';
import { getProfileImageUrl, getInitials } from '../../utils/imageUtils';
import { dashboardAPI } from '../../api/dashboard';
import { Sparkles, Users, UserCheck, UsersRound, FileText, TrendingUp, Loader2, Megaphone, Calendar, ChevronRight, PieChart as PieChartIcon, BarChart3, CalendarDays, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { downloadMenteeTemplate } from '../../api/import';
import { downloadMentorTemplate } from '../../api/mentorImport';
import { downloadGroupTemplate } from '../../api/groupImport';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadTemplate = async (type) => {
    try {
      setDownloadLoading(true);
      if (type === 'mentee') {
        await downloadMenteeTemplate();
        toast.success('Template Mentee berhasil didownload');
      } else if (type === 'mentor') {
        await downloadMentorTemplate();
        toast.success('Template Mentor berhasil didownload');
      } else if (type === 'kelompok') {
        await downloadGroupTemplate();
        toast.success('Template Kelompok berhasil didownload');
      } else {
        toast.info(`Template ${type} akan segera tersedia`);
      }
    } catch (error) {
      toast.error(`Gagal download template ${type}`);
      console.error(error);
    } finally {
      setDownloadLoading(false);
    }
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Pagi';
    if (hour < 15) return 'Siang';
    if (hour < 18) return 'Sore';
    return 'Malam';
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStatsComparison();
      if (response.status === 'success') {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      setAttendanceLoading(true);
      // Dummy data for now - will be replaced with real API call
      const dummyData = [
        { name: 'Hadir', value: 85, color: '#10B981' },
        { name: 'Izin', value: 8, color: '#3B82F6' },
        { name: 'Sakit', value: 5, color: '#F59E0B' },
        { name: 'Alpha', value: 2, color: '#EF4444' }
      ];
      setAttendanceData(dummyData);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      setTrendLoading(true);
      
      // Try to fetch from backend first
      try {
        const response = await dashboardAPI.getWeeklyTrend();
        if (response.status === 'success') {
          setTrendData(response.data);
          return;
        }
      } catch (apiError) {
        console.log('Backend endpoint not available, using dummy data');
      }
      
      // Fallback to dummy data if backend not available
      const weeks = [];
      const today = new Date();
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (i * 7) - today.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        weeks.push({
          week: `Minggu ${4 - i}`,
          dateRange: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
          meetings: Math.floor(Math.random() * 15) + 5 // Random data 5-20
        });
      }
      
      setTrendData(weeks);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setEventsLoading(true);
      
      // Try to fetch from backend first
      try {
        const response = await dashboardAPI.getUpcomingEvents();
        if (response.status === 'success') {
          // Transform backend data to match frontend format
          const transformedEvents = response.data.map(event => ({
            ...event,
            date: new Date(event.date + 'T' + event.time)
          }));
          setUpcomingEvents(transformedEvents);
          return;
        }
      } catch (apiError) {
        console.log('Backend endpoint not available, using dummy data');
      }
      
      // Fallback to dummy data
      const today = new Date();
      const events = [
        {
          id: 1,
          title: 'Pertemuan Kelompok A',
          type: 'meeting',
          date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
          time: '14:00'
        },
        {
          id: 2,
          title: 'Pengumuman Libur',
          type: 'announcement',
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
          time: '09:00'
        },
        {
          id: 3,
          title: 'Pertemuan Kelompok B',
          type: 'meeting',
          date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
          time: '16:00'
        }
      ];
      
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchAttendanceStats();
    fetchTrendData();
    fetchUpcomingEvents();
  }, []);

  return (
    <Layout activeMenu="Dashboard">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`relative overflow-hidden rounded-3xl p-8 transition-colors duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
            } shadow-xl`}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/20">
                    {getProfileImageUrl(user?.profile?.profile_picture) ? (
                      <img 
                        src={getProfileImageUrl(user?.profile?.profile_picture)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-[#4DABFF] to-blue-600 flex items-center justify-center ${getProfileImageUrl(user?.profile?.profile_picture) ? 'hidden' : 'flex'}`}>
                      <span className="text-white font-bold text-xl">
                        {getInitials(user?.profile?.full_name || user?.name, user?.email)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div>
                  <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    Selamat {getCurrentTime()}, {user?.profile?.full_name || user?.name || 'Admin'}!
                  </h1>
                  <p className={`text-lg transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Semoga hari ini produktif dalam mengelola Jejak Liqo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Sparkles className={`w-8 h-8 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
                <div className={`text-right ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <p className="text-sm font-medium">Dashboard Admin</p>
                  <p className="text-xs opacity-75">
                    {new Date().toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <div className={`w-full h-full rounded-full ${
                isDark ? 'bg-blue-400' : 'bg-blue-500'
              } blur-3xl transform translate-x-32 -translate-y-32`}></div>
            </div>
          </motion.div>

          {/* Grid Layout for Future Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Quick Actions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-4">
                {loading ? (
                  // Loading skeleton
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className={`rounded-2xl p-6 transition-colors duration-300 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    } shadow-sm animate-pulse`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Total Mentee Aktif */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`rounded-2xl p-6 transition-colors duration-300 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <h3 className={`text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Total Mentee Aktif
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats?.totals?.totalMentee || 0}
                      </p>

                    </motion.div>

                    {/* Total Mentor Aktif */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`rounded-2xl p-6 transition-colors duration-300 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <h3 className={`text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Total Mentor Aktif
                      </h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats?.totals?.totalMentor || 0}
                      </p>

                    </motion.div>

                    {/* Total Kelompok */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`rounded-2xl p-6 transition-colors duration-300 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <UsersRound className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <h3 className={`text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Total Kelompok
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats?.totals?.totalAdmin || 0}
                      </p>

                    </motion.div>

                    {/* Laporan 1 Minggu */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className={`rounded-2xl p-6 transition-colors duration-300 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <h3 className={`text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Laporan 1 Minggu
                      </h3>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {stats?.totals?.totalLaporan || 0}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {(() => {
                          const startOfWeek = new Date();
                          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 6);
                          return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
                        })()} minggu ini
                      </p>
                    </motion.div>
                  </>
                )}
              </div>
              
              {/* Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`h-80 rounded-2xl p-6 transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      Trend Pertemuan 4 Minggu
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total pertemuan per minggu
                    </p>
                  </div>
                </div>
                
                {trendLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className={`w-8 h-8 animate-spin ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke={isDark ? '#374151' : '#E5E7EB'}
                        />
                        <XAxis 
                          dataKey="week"
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: isDark ? '#9CA3AF' : '#6B7280' 
                          }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: isDark ? '#9CA3AF' : '#6B7280' 
                          }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDark ? '#374151' : '#ffffff',
                            border: isDark ? '1px solid #4B5563' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            color: isDark ? '#ffffff' : '#000000'
                          }}
                          formatter={(value, name, props) => [
                            `${value} pertemuan`,
                            props.payload.dateRange
                          ]}
                          labelFormatter={(label) => label}
                        />
                        <Bar 
                          dataKey="meetings" 
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Right Column - Quick Actions & Calendar */}
            <div className="space-y-8">
              {/* Download Templates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-2xl p-6 transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Download Template Import
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleDownloadTemplate('mentee')}
                    disabled={downloadLoading}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all disabled:opacity-50 ${
                    isDark 
                      ? 'bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border border-blue-800' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
                  }`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{downloadLoading ? 'Downloading...' : 'Template Mentee'}</span>
                  </button>
                  <button 
                    onClick={() => handleDownloadTemplate('mentor')}
                    disabled={downloadLoading}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all disabled:opacity-50 ${
                    isDark 
                      ? 'bg-green-900/20 hover:bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
                  }`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Template Mentor</span>
                  </button>
                  <button 
                    onClick={() => handleDownloadTemplate('kelompok')}
                    disabled={downloadLoading}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all disabled:opacity-50 ${
                    isDark 
                      ? 'bg-purple-900/20 hover:bg-purple-900/30 text-purple-400 border border-purple-800' 
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200'
                  }`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Template Kelompok</span>
                  </button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`rounded-2xl p-6 transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Aksi Cepat
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/kelola-pengumuman')}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    } hover:shadow-md`}
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Kelola Pengumuman</p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Buat atau edit pengumuman</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/catatan-pertemuan')}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    } hover:shadow-md`}
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Catat Pertemuan</p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Tambah catatan pertemuan baru</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Attendance Chart - Moved here */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`h-80 rounded-2xl p-6 transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      Tingkat Kehadiran Mentee
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Distribusi status kehadiran
                    </p>
                  </div>
                </div>
                
                {attendanceLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className={`w-8 h-8 animate-spin ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                ) : (
                  <div className="h-48 flex">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={attendanceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {attendanceData?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: isDark ? '#374151' : '#ffffff',
                              border: isDark ? '1px solid #4B5563' : '1px solid #E5E7EB',
                              borderRadius: '8px',
                              color: isDark ? '#ffffff' : '#000000'
                            }}
                            formatter={(value) => [`${value}%`, 'Persentase']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-24 flex flex-col justify-center space-y-2 ml-4">
                      {attendanceData?.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span className={`text-xs font-medium ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {entry.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
              
              {/* Calendar Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className={`rounded-2xl p-6 transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      Event Penting
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Pertemuan & pengumuman mendatang
                    </p>
                  </div>
                </div>
                
                {eventsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className={`w-8 h-8 animate-spin ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {upcomingEvents?.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-xl border transition-colors ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              event.type === 'meeting'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-orange-100 dark:bg-orange-900/30'
                            }`}>
                              {event.type === 'meeting' ? (
                                <Users className={`w-4 h-4 ${
                                  event.type === 'meeting'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`} />
                              ) : (
                                <Megaphone className={`w-4 h-4 ${
                                  event.type === 'meeting'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${
                                isDark ? 'text-white' : 'text-gray-800'
                              }`}>
                                {event.title}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className={`w-3 h-3 ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`} />
                                  <span className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {event.date.toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className={`w-3 h-3 ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`} />
                                  <span className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {event.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CalendarDays className={`w-12 h-12 mx-auto mb-3 ${
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Tidak ada event mendatang
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </Layout>
  );
};

export default AdminDashboard;