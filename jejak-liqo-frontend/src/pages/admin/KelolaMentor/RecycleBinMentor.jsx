import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, RotateCcw, Trash2, Search, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getDeletedMentors, restoreMentor, forceDeleteMentor, getMentorForceInfo } from '../../../api/mentor';
import LoadingState from '../../../components/common/LoadingState';

const RecycleBinMentor = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMentors, setSelectedMentors] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showForceDeleteModal, setShowForceDeleteModal] = useState(false);
  const [forceDeleteInfo, setForceDeleteInfo] = useState(null);
  const [forceDeleteType, setForceDeleteType] = useState('single'); // 'single' or 'bulk'

  useEffect(() => {
    fetchDeletedMentors();
  }, [currentPage, searchTerm]);

  const fetchDeletedMentors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm || undefined
      };
      const response = await getDeletedMentors(params);
      setMentors(response.data || []);
      setTotalPages(response.pagination?.last_page || 1);
    } catch (error) {
      console.error('Error fetching deleted mentors:', error);
      toast.error('Gagal memuat data mentor yang dihapus');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    // Optimistic update - remove from UI immediately
    setMentors(prev => prev.filter(mentor => mentor.id !== id));
    toast.success('Mentor berhasil dipulihkan');
    
    try {
      await restoreMentor(id);
    } catch (error) {
      toast.error('Gagal memulihkan mentor');
      // Refresh on error
      fetchDeletedMentors();
    }
  };

  const handleForceDelete = async (id) => {
    try {
      const infoResponse = await getMentorForceInfo(id);
      const info = infoResponse.data;
      
      setForceDeleteInfo(info);
      setForceDeleteType('single');
      setShowForceDeleteModal(true);
    } catch (error) {
      console.error('Force delete error:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus mentor secara permanen';
      toast.error(errorMessage);
    }
  };

  const confirmForceDelete = async () => {
    try {
      if (forceDeleteType === 'single') {
        await forceDeleteMentor(forceDeleteInfo.mentor.id);
        toast.success('Mentor berhasil dihapus permanen');
      } else {
        const results = await Promise.allSettled(selectedMentors.map(id => forceDeleteMentor(id)));
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;
        
        if (successful > 0) {
          toast.success(`${successful} mentor berhasil dihapus permanen`);
        }
        if (failed > 0) {
          toast.error(`${failed} mentor gagal dihapus`);
        }
        setSelectedMentors([]);
      }
      
      setShowForceDeleteModal(false);
      fetchDeletedMentors();
    } catch (error) {
      console.error('Force delete error:', error);
      toast.error('Gagal menghapus mentor');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMentors(mentors.map(mentor => mentor.id));
    } else {
      setSelectedMentors([]);
    }
  };

  const handleSelectMentor = (mentorId, checked) => {
    if (checked) {
      setSelectedMentors([...selectedMentors, mentorId]);
    } else {
      setSelectedMentors(selectedMentors.filter(id => id !== mentorId));
    }
  };

  const handleBulkRestore = async () => {
    if (selectedMentors.length === 0) return;
    
    // Optimistic update - remove from UI immediately
    const restoredIds = [...selectedMentors];
    setMentors(prev => prev.filter(mentor => !restoredIds.includes(mentor.id)));
    setSelectedMentors([]);
    toast.success(`${restoredIds.length} mentor berhasil dipulihkan`);
    
    try {
      await Promise.all(restoredIds.map(id => restoreMentor(id)));
    } catch (error) {
      toast.error('Gagal memulihkan beberapa mentor');
      // Refresh on error
      fetchDeletedMentors();
    }
  };

  const handleBulkForceDelete = async () => {
    if (selectedMentors.length === 0) return;
    
    // Show modal immediately with basic info
    const bulkInfo = {
      total_mentors: selectedMentors.length,
      mentors_with_groups: 0,
      mentor_details: []
    };
    
    setForceDeleteInfo(bulkInfo);
    setForceDeleteType('bulk');
    setShowForceDeleteModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout activeMenu="Kelola Mentor">
      <div className="p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/kelola-mentor')}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              } transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Recycle Bin Mentor
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Mentor → Recycle Bin
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Actions */}
        <motion.div 
          className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Cari mentor yang dihapus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {selectedMentors.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkRestore}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Pulihkan ({selectedMentors.length})</span>
                </button>
                <button
                  onClick={handleBulkForceDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Hapus Permanen ({selectedMentors.length})</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div 
          className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMentors.length === mentors.length && mentors.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mentor
                  </th>
                  <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </th>
                  <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Jenis Kelamin
                  </th>
                  <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dihapus Pada
                  </th>
                  <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4">
                      <LoadingState type="dots" size="md" text="Memuat data mentor..." />
                    </td>
                  </tr>
                ) : mentors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tidak ada mentor yang dihapus
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor) => (
                    <tr key={mentor.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedMentors.includes(mentor.id)}
                          onChange={(e) => handleSelectMentor(mentor.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {mentor.profile?.profile_picture ? (
                            <img
                              src={`http://127.0.0.1:8000/storage/${mentor.profile.profile_picture}`}
                              alt={mentor.profile?.full_name || 'Mentor'}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium ${
                              mentor.profile?.profile_picture ? 'hidden' : 'flex'
                            }`}
                          >
                            {mentor.profile?.full_name?.charAt(0) || mentor.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {mentor.profile?.full_name || 'Nama tidak tersedia'}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {mentor.profile?.nickname || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {mentor.email}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mentor.profile?.gender === 'Ikhwan' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : mentor.profile?.gender === 'Akhwat'
                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {mentor.profile?.gender || 'Tidak diset'}
                        </span>
                      </td>
                      <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(mentor.deleted_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setShowDetailModal(true);
                            }}
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            } transition-colors`}
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleRestore(mentor.id)}
                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                            title="Pulihkan"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => handleForceDelete(mentor.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="Hapus Permanen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } transition-colors`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } transition-colors`}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Detail Modal */}
        {showDetailModal && selectedMentor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Detail Mentor
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    } transition-colors`}
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-6">
                    {selectedMentor.profile?.profile_picture ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${selectedMentor.profile.profile_picture}`}
                        alt={selectedMentor.profile?.full_name || 'Mentor'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200 ${
                        selectedMentor.profile?.profile_picture ? 'hidden' : 'flex'
                      }`}
                    >
                      {selectedMentor.profile?.full_name?.charAt(0) || selectedMentor.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Email
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.email}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Nama Lengkap
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.full_name || '-'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Nama Panggilan
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.nickname || '-'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Jenis Kelamin
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.gender || '-'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Tanggal Lahir
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.birth_date || '-'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Nomor Telepon
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.phone_number || '-'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Pekerjaan
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.job || '-'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Hobi
                      </label>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMentor.profile?.hobby || '-'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Alamat
                    </label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedMentor.profile?.address || '-'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Dihapus Pada
                    </label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedMentor.deleted_at)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      handleRestore(selectedMentor.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <RotateCcw size={16} />
                    <span>Pulihkan</span>
                  </button>
                  <button
                    onClick={() => {
                      handleForceDelete(selectedMentor.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Hapus Permanen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Force Delete Modal */}
        {showForceDeleteModal && forceDeleteInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center`}>
                    <span className="text-red-500 mr-2">⚠️</span>
                    Konfirmasi Hapus Permanen
                  </h3>
                  <button
                    onClick={() => setShowForceDeleteModal(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {forceDeleteType === 'single' ? (
                    <>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                          Mentor yang akan dihapus:
                        </h4>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {forceDeleteInfo.mentor.full_name || forceDeleteInfo.mentor.email}
                        </p>
                      </div>

                      {forceDeleteInfo.has_groups ? (
                        <div className={`p-4 rounded-lg border-2 border-red-200 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                          <h4 className={`font-semibold text-red-600 mb-2 flex items-center`}>
                            <span className="mr-2">⚠️</span>
                            PERINGATAN!
                          </h4>
                          <p className={`${isDark ? 'text-red-300' : 'text-red-700'} mb-3`}>
                            {forceDeleteInfo.warning_message}
                          </p>
                          <div className={`${isDark ? 'text-red-300' : 'text-red-700'}`}>
                            <p className="font-medium mb-2">Kelompok yang terpengaruh:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {forceDeleteInfo.groups.map((group, index) => (
                                <li key={index}>
                                  {group.group_name} ({group.mentees_count} mentees)
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-200`}>
                          <p className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                            Mentor ini tidak memiliki kelompok aktif.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                          Total mentor yang akan dihapus: {forceDeleteInfo.total_mentors}
                        </h4>
                      </div>

                      <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-200`}>
                        <p className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          Semua mentor yang dipilih tidak memiliki kelompok aktif.
                        </p>
                      </div>
                    </>
                  )}

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border-l-4 border-red-500`}>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                      ⚠️ Tindakan ini tidak dapat dibatalkan!
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowForceDeleteModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmForceDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Ya, Hapus Permanen</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default RecycleBinMentor;