import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import meetingsAPI from '../../../api/meetings';
import MeetingRestoreModal from '../../../components/admin/Catat Pertemuan/MeetingRestoreModal';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowPathIcon,
  TrashIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const TrashedPertemuan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTrashedMeetings();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrashedMeetings();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTrashedMeetings = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await meetingsAPI.getTrashedMeetings(params);
      setMeetings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trashed meetings:', error);
      toast.error('Gagal memuat data pertemuan yang dihapus');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      await meetingsAPI.restoreMeeting(selectedMeeting.id);
      toast.success('Catatan pertemuan berhasil dipulihkan');
      setShowRestoreModal(false);
      setSelectedMeeting(null);
      fetchTrashedMeetings();
    } catch (error) {
      console.error('Error restoring meeting:', error);
      toast.error('Gagal memulihkan catatan pertemuan');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleForceDelete = async () => {
    try {
      setIsDeleting(true);
      await meetingsAPI.forceDeleteMeeting(selectedMeeting.id);
      toast.success('Catatan pertemuan berhasil dihapus permanen');
      setShowDeleteModal(false);
      setSelectedMeeting(null);
      fetchTrashedMeetings();
    } catch (error) {
      console.error('Error force deleting meeting:', error);
      toast.error('Gagal menghapus catatan pertemuan secara permanen');
    } finally {
      setIsDeleting(false);
    }
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

  return (
    <Layout activeMenu="Catatan Pertemuan">
      <div className="p-3 sm:p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center space-x-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button
            onClick={() => navigate('/admin/catatan-pertemuan')}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Pertemuan Terhapus
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola catatan pertemuan yang telah dihapus
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Cari topik, tempat, atau kelompok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </motion.div>

        {/* Meetings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : meetings.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <TrashIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Tidak ada pertemuan terhapus</h3>
            <p>Semua catatan pertemuan masih aktif</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                } transition-all duration-200 opacity-75`}
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
                      {meeting.topic || 'Pertemuan Kelompok'}
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
                      {meeting.group?.mentor?.name}
                    </span>
                  </div>
                </div>

                {/* Deleted Info */}
                <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Dihapus pada: {formatDate(meeting.deleted_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setShowRestoreModal(true);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span className="text-sm">Pulihkan</span>
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

        <MeetingRestoreModal
          isOpen={showRestoreModal}
          onClose={() => {
            setShowRestoreModal(false);
            setSelectedMeeting(null);
          }}
          onConfirm={handleRestore}
          meeting={selectedMeeting}
          isRestoring={isRestoring}
        />

        {/* Force Delete Modal */}
        {showDeleteModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <TrashIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Hapus Permanen
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tindakan ini tidak dapat dibatalkan
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mb-2`}>
                    <strong>Topik:</strong> {selectedMeeting.topic || 'Pertemuan Kelompok'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mb-2`}>
                    <strong>Kelompok:</strong> {selectedMeeting.group?.name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    <strong>Tanggal:</strong> {formatDate(selectedMeeting.meeting_date)}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleForceDelete}
                    disabled={isDeleting}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                      isDeleting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {isDeleting ? 'Menghapus...' : 'Hapus Permanen'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrashedPertemuan;