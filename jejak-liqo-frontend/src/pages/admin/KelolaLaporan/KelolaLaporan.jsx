import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Info,
  Calendar,
  MapPin,
  Users,
  Monitor,
  Wifi,
  WifiOff,
  BookOpen,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Eye,
  Trophy,
  Medal,
  Award,
  Star,
  UserCog
} from 'lucide-react';
import CardTotalAndWeek from '../../../components/admin/Catat Pertemuan/CardTotalAndWeek';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { meetingAPI, downloadFile } from '../../../utils/api';
import LoadingState from '../../../components/common/LoadingState';
import GroupsSectionCard from '../../../components/admin/KelolaLaporan/TopGroupsCard';
import MenteesSectionCard from '../../../components/admin/KelolaLaporan/TopMenteesCard';
import MentorsSectionCard from '../../../components/admin/KelolaLaporan/MentorsSectionCard';
import YearlyReportModal from '../../../components/admin/KelolaLaporan/Laporan Tahunan/YearlyReportModal';

const KelolaLaporan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    group_id: '',
    mentor_id: '',
    meeting_date: '',
    place: '',
    topic: '',
    notes: '',
    meeting_type: ''
  });
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filters, setFilters] = useState({
    meeting_type: '',
    mentor_id: '',
    group_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    online: 0,
    offline: 0,
    assignment: 0,
    activeMentors: 0
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    lineData: [],
    barData: []
  });
  const [topGroups, setTopGroups] = useState([]);
  const [topMentees, setTopMentees] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [leastActiveGroups, setLeastActiveGroups] = useState([]);
  const [leastActiveMentors, setLeastActiveMentors] = useState([]);
  const [leastActiveMentees, setLeastActiveMentees] = useState([]);
  const [loadingTopGroups, setLoadingTopGroups] = useState(true);
  const [loadingTopMentees, setLoadingTopMentees] = useState(true);
  const [loadingTopMentors, setLoadingTopMentors] = useState(true);
  const [loadingLeastActiveGroups, setLoadingLeastActiveGroups] = useState(true);
  const [loadingLeastActiveMentors, setLoadingLeastActiveMentors] = useState(true);
  const [loadingLeastActiveMentees, setLoadingLeastActiveMentees] = useState(true);
  const [showYearlyModal, setShowYearlyModal] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchGroups();
    fetchMentors();
    fetchStats();
    fetchTopGroups();
    fetchTopMentees();
    fetchTopMentors();
    fetchLeastActiveGroups();
    fetchLeastActiveMentors();
    fetchLeastActiveMentees();
  }, [pagination.current_page, filters]);

  useEffect(() => {
    const loadChartData = async () => {
      await generateChartData();
    };
    loadChartData();
  }, [reports]);

  const fetchReports = async () => {
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(filters.meeting_type && { meeting_type: filters.meeting_type }),
        ...(filters.mentor_id && { mentor_id: filters.mentor_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await meetingAPI.getMeetings(params);
      const data = response.data;
      
      setReports(data.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.data?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/meetings/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat statistik');
    }
  };

  const fetchTopGroups = async () => {
    try {
      setLoadingTopGroups(true);
      const response = await fetch('http://localhost:8000/api/reports/top-groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopGroups(data.data || []);
      } else {
        toast.error('Gagal memuat data kelompok teraktif');
      }
    } catch (error) {
      console.error('Error fetching top groups:', error);
      toast.error('Gagal memuat data kelompok teraktif');
    } finally {
      setLoadingTopGroups(false);
    }
  };

  const fetchLeastActiveGroups = async () => {
    try {
      setLoadingLeastActiveGroups(true);
      const response = await fetch('http://localhost:8000/api/reports/least-active-groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeastActiveGroups(data.data || []);
      } else {
        toast.error('Gagal memuat data kelompok kurang aktif');
        setLeastActiveGroups([]);
      }
    } catch (error) {
      console.error('Error fetching least active groups:', error);
      toast.error('Gagal memuat data kelompok kurang aktif');
      setLeastActiveGroups([]);
    } finally {
      setLoadingLeastActiveGroups(false);
    }
  };

  const fetchTopMentees = async () => {
    try {
      setLoadingTopMentees(true);
      const response = await fetch('http://localhost:8000/api/reports/top-mentees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopMentees(data.data || []);
      } else {
        toast.error('Gagal memuat data mentee teraktif');
      }
    } catch (error) {
      console.error('Error fetching top mentees:', error);
      toast.error('Gagal memuat data mentee teraktif');
    } finally {
      setLoadingTopMentees(false);
    }
  };

  const fetchTopMentors = async () => {
    try {
      setLoadingTopMentors(true);
      const response = await fetch('http://localhost:8000/api/reports/top-mentors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopMentors(data.data || []);
      } else {
        toast.error('Gagal memuat data mentor terbaik');
        setTopMentors([]);
      }
    } catch (error) {
      console.error('Error fetching top mentors:', error);
      toast.error('Gagal memuat data mentor terbaik');
      setTopMentors([]);
    } finally {
      setLoadingTopMentors(false);
    }
  };

  const fetchLeastActiveMentors = async () => {
    try {
      setLoadingLeastActiveMentors(true);
      const response = await fetch('http://localhost:8000/api/reports/least-active-mentors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeastActiveMentors(data.data || []);
      } else {
        toast.error('Gagal memuat data mentor jarang aktif');
        setLeastActiveMentors([]);
      }
    } catch (error) {
      console.error('Error fetching least active mentors:', error);
      toast.error('Gagal memuat data mentor jarang aktif');
      setLeastActiveMentors([]);
    } finally {
      setLoadingLeastActiveMentors(false);
    }
  };

  const fetchLeastActiveMentees = async () => {
    try {
      setLoadingLeastActiveMentees(true);
      const response = await fetch('http://localhost:8000/api/reports/least-active-mentees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeastActiveMentees(data.data || []);
      } else {
        toast.error('Gagal memuat data mentee jarang aktif');
        setLeastActiveMentees([]);
      }
    } catch (error) {
      console.error('Error fetching least active mentees:', error);
      toast.error('Gagal memuat data mentee jarang aktif');
      setLeastActiveMentees([]);
    } finally {
      setLoadingLeastActiveMentees(false);
    }
  };

  const fetchYearlyTrend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping yearly trend fetch');
        return [];
      }
      
      const response = await fetch('http://localhost:8000/api/dashboard/yearly-trend', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      } else {
        console.error('Yearly trend API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching yearly trend:', error);
    }
    // Return empty array if API fails
    return [];
  };

  const generateChartData = async () => {
    const typeCount = reports.reduce((acc, report) => {
      acc[report.meeting_type] = (acc[report.meeting_type] || 0) + 1;
      return acc;
    }, {});
    
    const pieData = Object.entries(typeCount).map(([type, count]) => ({
      name: type,
      value: count,
      color: type === 'Online' ? '#3B82F6' : type === 'Offline' ? '#10B981' : '#8B5CF6'
    }));

    // Get yearly trend data from API
    const yearlyTrendData = await fetchYearlyTrend();

    setChartData({ pieData, lineData: yearlyTrendData });
  };

  const exportPDF = async () => {
    try {
      const response = await meetingAPI.exportPDF({ month: filters.month, year: filters.year });
      downloadFile(response.data, `laporan_meetings_${filters.month}-${filters.year}.pdf`);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh PDF');
    }
  };

  const exportExcel = async () => {
    try {
      const response = await meetingAPI.exportExcel({ year: filters.year });
      downloadFile(response.data, `laporan_meetings_${filters.year}.xlsx`);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh Excel');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mentors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await meetingAPI.createMeeting(formData);
      toast.success('Laporan berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({ group_id: '', mentor_id: '', meeting_date: '', place: '', topic: '', notes: '', meeting_type: '' });
      fetchReports();
    } catch (error) {
      toast.error('Gagal menambahkan laporan');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await meetingAPI.updateMeeting(selectedReport.id, formData);
      toast.success('Laporan berhasil diperbarui');
      setShowEditModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      toast.error('Gagal memperbarui laporan');
    }
  };

  const handleDelete = async () => {
    try {
      await meetingAPI.deleteMeeting(selectedReport.id);
      toast.success('Laporan berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      toast.error('Gagal menghapus laporan');
    }
  };

  const filteredReports = reports.filter(report =>
    report.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.mentor?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (report) => {
    setSelectedReport(report);
    setFormData({
      group_id: report.group?.id || '',
      mentor_id: report.mentor?.id || '',
      meeting_date: report.meeting_date || '',
      place: report.place || '',
      topic: report.topic || '',
      notes: report.notes || '',
      meeting_type: report.meeting_type || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (report) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  const openDetailModal = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'Online':
        return <Wifi size={16} className="text-blue-500" />;
      case 'Offline':
        return <WifiOff size={16} className="text-green-500" />;
      case 'Assignment':
        return <BookOpen size={16} className="text-purple-500" />;
      default:
        return <Monitor size={16} className="text-gray-500" />;
    }
  };

  const getMeetingTypeBadge = (type) => {
    const badges = {
      'Online': 'bg-blue-100 text-blue-800 border-blue-200',
      'Offline': 'bg-green-100 text-green-800 border-green-200',
      'Assignment': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatWeekRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    
    const endFormatted = end.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <Layout activeMenu="Kelola Laporan">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <BarChart3 size={32} className="text-blue-600" />
              Kelola Laporan Pertemuan
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Dashboard analitik dan manajemen laporan pertemuan
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/admin/laporan-bulanan')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Plus size={20} />
              <span>Laporan Bulanan</span>
            </button>
            <button
              onClick={() => setShowYearlyModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              <Calendar size={20} />
              <span>Laporan Tahunan</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <CardTotalAndWeek statistics={stats} formatWeekRange={formatWeekRange} />
        </motion.div>

        {/* Charts Section */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Tren Tahunan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => Math.floor(value)} />
                <Tooltip />
                <Area type="monotone" dataKey="meetings" stroke="#10B981" fill="#10B981" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Rankings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Groups Section */}
          <GroupsSectionCard 
            topGroups={topGroups} 
            loadingTopGroups={loadingTopGroups}
            leastActiveGroups={leastActiveGroups}
            loadingLeastActiveGroups={loadingLeastActiveGroups}
          />

          {/* Mentees Section */}
          <MenteesSectionCard 
            topMentees={topMentees} 
            loadingTopMentees={loadingTopMentees}
            leastActiveMentees={leastActiveMentees}
            loadingLeastActiveMentees={loadingLeastActiveMentees}
          />

          {/* Mentors Section */}
          <MentorsSectionCard 
            topMentors={topMentors} 
            loadingTopMentors={loadingTopMentors}
            leastActiveMentors={leastActiveMentors}
            loadingLeastActiveMentors={loadingLeastActiveMentors}
          />
        </div>
        
        {/* Yearly Report Modal */}
        <YearlyReportModal 
          show={showYearlyModal} 
          onClose={() => setShowYearlyModal(false)} 
        />
      </div>
    </Layout>
  );
};

export default KelolaLaporan;