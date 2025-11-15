import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import meetingsAPI from '../../../api/meetings';
import MeetingDetailModal from '../../../components/admin/Catat Pertemuan/MeetingDetailModal';
import MeetingDeleteModal from '../../../components/admin/Catat Pertemuan/MeetingDeleteModal';
import CardTotalAndWeek from '../../../components/admin/Catat Pertemuan/CardTotalAndWeek';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import LoadingState from '../../../components/common/LoadingState';

const CatatanPertemuan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [pagination, setPagination] = useState({});
  const [statistics, setStatistics] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchGroups();
    fetchStatistics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetings();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGroup, selectedType, dateFrom, dateTo]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGroup && { group_id: selectedGroup }),
        ...(selectedType && { meeting_type: selectedType }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      };
      const response = await meetingsAPI.getMeetings(params);
      setMeetings(response.data.data || []);
      setPagination(response.data.pagination || {});
      setHasShownError(false);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      if (!hasShownError) {
        toast.error('Gagal memuat data pertemuan');
        setHasShownError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await meetingsAPI.getGroups();
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await meetingsAPI.getStatistics();
      setStatistics(response.data.data || {});
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      setIsDeleting(true);
      await meetingsAPI.deleteMeeting(selectedMeeting.id);
      toast.success('Catatan pertemuan berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedMeeting(null);
      fetchMeetings();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Gagal menghapus catatan pertemuan');
    } finally {
      setIsDeleting(false);
    }
  };



  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGroup('');
    setSelectedType('');
    setDateFrom('');
    setDateTo('');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Online':
        return <ComputerDesktopIcon className="w-6 h-6" />;
      case 'Offline':
        return <BuildingOfficeIcon className="w-6 h-6" />;
      case 'Assignment':
        return <ClipboardDocumentListIcon className="w-6 h-6" />;
      default:
        return <CalendarDaysIcon className="w-6 h-6" />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'Online': isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200',
      'Offline': isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200',
      'Assignment': isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200',
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[type] || colors['Online']}`}>
        {type}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const getAttendanceStats = (attendances) => {
    if (!attendances || attendances.length === 0) {
      return { hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0 };
    }
    
    const hadir = attendances.filter(a => a.status === 'Hadir').length;
    const sakit = attendances.filter(a => a.status === 'Sakit').length;
    const izin = attendances.filter(a => a.status === 'Izin').length;
    const alpa = attendances.filter(a => a.status === 'Alpa').length;
    
    return { hadir, sakit, izin, alpa, total: attendances.length };
  };

  return (
    <Layout activeMenu="Catatan Pertemuan">
      <div className="p-3 sm:p-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4 sm:mb-0">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Catatan Pertemuan
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola catatan pertemuan kelompok mentoring
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin/catatan-pertemuan/trashed')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrashIcon className="w-5 h-5" />
              <span>Terhapus</span>
            </button>
            <button
              onClick={() => navigate('/admin/catatan-pertemuan/tambah')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Tambah Pertemuan</span>
            </button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          className="space-y-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* First Row: Total and This Weeks */}
          <CardTotalAndWeek statistics={statistics} formatWeekRange={formatWeekRange} />
          
          {/* Second Row: Online, Offline, Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <ComputerDesktopIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Online</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.online_meetings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <BuildingOfficeIcon className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Offline</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.offline_meetings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <ClipboardDocumentListIcon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tugas</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {statistics.assignment_meetings || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Cari topik, tempat, mentor, atau catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-500 text-white border-blue-500'
                  : isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Kelompok
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Semua Kelompok</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipe Pertemuan
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Semua Tipe</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } transition-colors`}
                >
                  Reset Filter
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Meetings List */}
        {loading ? (
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full">
              <tbody>
                <tr>
                  <td colSpan="8" className="px-6 py-4">
                    <LoadingState type="dots" size="md" text="Memuat data pertemuan..." />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : meetings.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada catatan pertemuan</h3>
            <p>Mulai buat catatan pertemuan pertama Anda</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {meetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl shadow-sm border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                } transition-all duration-200`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-1 rounded-lg ${
                        meeting.meeting_type === 'Online' 
                          ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                          : meeting.meeting_type === 'Offline'
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          : isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {getTypeIcon(meeting.meeting_type)}
                      </div>
                      {getTypeBadge(meeting.meeting_type)}
                    </div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                      Materi: {meeting.topic || 'Pertemuan Kelompok'}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {meeting.group?.name}
                    </p>
                  </div>
                </div>

                {/* Meeting Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDate(meeting.meeting_date)}
                    </span>
                  </div>
                  
                  {meeting.place && (
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {meeting.place}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {meeting.group?.mentor?.name} • {meeting.group?.mentees_count || 0} mentees
                    </span>
                  </div>
                </div>

                {/* Attendance Stats */}
                {meeting.attendances && meeting.attendances.length > 0 && (
                  <div className="grid grid-cols-4 gap-1 mb-4">
                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Hadir</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        {getAttendanceStats(meeting.attendances).hadir}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Sakit</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        {getAttendanceStats(meeting.attendances).sakit}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Izin</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {getAttendanceStats(meeting.attendances).izin}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>Alpa</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {getAttendanceStats(meeting.attendances).alpa}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes Preview */}
                {meeting.notes && (
                  <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                      {meeting.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setShowDetailModal(true);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">Detail</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/admin/catatan-pertemuan/edit/${meeting.id}`)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setShowDeleteModal(true);
                    }}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modals */}
        <MeetingDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMeeting(null);
          }}
          meeting={selectedMeeting}
        />

        <MeetingDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMeeting(null);
          }}
          onConfirm={handleDeleteMeeting}
          meeting={selectedMeeting}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
};

export default CatatanPertemuan;