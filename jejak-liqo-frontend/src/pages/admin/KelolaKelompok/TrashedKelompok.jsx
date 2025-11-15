import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import groupsAPI from '../../../api/groups';
import { 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  Trash2, 
  Users,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingState from '../../../components/common/LoadingState';

const TrashedKelompok = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [trashedGroups, setTrashedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchTrashedGroups();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrashedGroups();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTrashedGroups = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { search: searchTerm })
      };
      console.log('Fetching trashed groups with params:', params);
      const response = await groupsAPI.getTrashedGroups(params);
      console.log('Trashed groups response:', response.data);
      setTrashedGroups(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trashed groups:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Gagal memuat data kelompok terhapus');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      console.log('Restoring group:', selectedGroup.id);
      const response = await groupsAPI.restoreGroup(selectedGroup.id);
      console.log('Restore response:', response.data);
      toast.success(response.data.message || 'Kelompok berhasil dipulihkan');
      setShowRestoreModal(false);
      setSelectedGroup(null);
      fetchTrashedGroups();
    } catch (error) {
      console.error('Error restoring group:', error);
      toast.error(error.response?.data?.message || 'Gagal memulihkan kelompok');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      console.log('Force deleting group:', selectedGroup.id);
      const response = await groupsAPI.forceDeleteGroup(selectedGroup.id);
      console.log('Force delete response:', response.data);
      toast.success(response.data.message || 'Kelompok berhasil dihapus permanen');
      setShowDeleteModal(false);
      setSelectedGroup(null);
      fetchTrashedGroups();
    } catch (error) {
      console.error('Error force deleting group:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus kelompok secara permanen');
    }
  };

  const getGenderBadge = (genderDistribution) => {
    const ikhwanCount = genderDistribution?.ikhwan || 0;
    const akhwatCount = genderDistribution?.akhwat || 0;
    
    if (ikhwanCount > 0 && akhwatCount === 0) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
          Ikhwan
        </span>
      );
    } else if (akhwatCount > 0 && ikhwanCount === 0) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-pink-900/20 text-pink-400' : 'bg-pink-100 text-pink-800'}`}>
          Akhwat
        </span>
      );
    } else if (ikhwanCount > 0 && akhwatCount > 0) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-800'}`}>
          Campuran
        </span>
      );
    } else {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
          Kosong
        </span>
      );
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <Layout activeMenu="Kelola Kelompok">
      <div className="p-3 sm:p-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <button
                onClick={() => navigate('/admin/kelola-kelompok')}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Kelompok Terhapus
              </h1>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola kelompok yang telah dihapus sementara
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            <input
              type="text"
              placeholder="Cari kelompok terhapus..."
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

        {/* Cards List */}
        {loading ? (
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full">
              <tbody>
                <tr>
                  <td colSpan="8" className="px-6 py-4">
                    <LoadingState type="dots" size="md" text="Memuat data kelompok terhapus..." />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : trashedGroups.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Trash2 size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Tidak ada kelompok terhapus</h3>
            <p>Semua kelompok masih aktif</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 min-[1173px]:grid-cols-2 xl:grid-cols-1 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {trashedGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl shadow-sm border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                } transition-all duration-200`}
              >
                {/* Mobile/Tablet Layout */}
                <div className="block xl:hidden">
                  {/* Header with status indicator */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {group.group_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getGenderBadge(group.gender_distribution)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          Terhapus
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {group.description && (
                    <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                        {group.description}
                      </p>
                    </div>
                  )}

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <Users size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mentees</span>
                      </div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {group.mentees_count || 0}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                          <Calendar size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Pertemuan</span>
                      </div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {group.meetings_count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mentor</span>
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {group.mentor?.name || 'Tidak ada mentor'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dihapus pada</span>
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatDateTime(group.deleted_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowRestoreModal(true);
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                        isDark 
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      <RotateCcw size={16} className="inline mr-2" />
                      Pulihkan
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowDeleteModal(true);
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                        isDark 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <Trash2 size={16} className="inline mr-2" />
                      Hapus Permanen
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden xl:block">
                  <div className="flex items-center justify-between">
                    {/* Left: Group Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {group.group_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getGenderBadge(group.gender_distribution)}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            Terhapus
                          </span>
                        </div>
                      </div>
                      
                      {group.description && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3 max-w-md`}>
                          {group.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {group.mentor?.name || 'Tidak ada mentor'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {group.mentees_count || 0} mentee
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {group.meetings_count || 0} pertemuan
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            Dihapus {formatDateTime(group.deleted_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex space-x-3 ml-6">
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowRestoreModal(true);
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                          isDark 
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        <RotateCcw size={16} className="inline mr-2" />
                        Pulihkan
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowDeleteModal(true);
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                          isDark 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        <Trash2 size={16} className="inline mr-2" />
                        Hapus Permanen
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Restore Modal */}
        {showRestoreModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <RotateCcw size={24} className={isDark ? 'text-green-400' : 'text-green-600'} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Pulihkan Kelompok
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Kelompok akan kembali aktif
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <strong>Kelompok:</strong> {selectedGroup.group_name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <strong>Mentor:</strong> {selectedGroup.mentor?.name || 'Tidak ada'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Mentees:</strong> {selectedGroup.mentees_count || 0} orang
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowRestoreModal(false);
                      setSelectedGroup(null);
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRestore}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    Pulihkan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <Trash2 size={24} className={isDark ? 'text-red-400' : 'text-red-600'} />
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
                    <strong>Kelompok:</strong> {selectedGroup.group_name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mb-2`}>
                    <strong>Mentor:</strong> {selectedGroup.mentor?.name || 'Tidak ada'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mb-3`}>
                    <strong>Mentees:</strong> {selectedGroup.mentees_count || 0} orang akan dilepas dari kelompok
                  </p>
                  <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} font-medium`}>
                    ⚠️ Data kelompok akan dihapus permanen dan tidak dapat dipulihkan
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedGroup(null);
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePermanentDelete}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Hapus Permanen
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

export default TrashedKelompok;