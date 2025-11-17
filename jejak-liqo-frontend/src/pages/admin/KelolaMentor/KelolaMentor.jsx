import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import api from '../../../api/axiosInstance';
import { blockMentor, unblockMentor } from '../../../api/mentor';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Mail,
  Phone,
  Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingState from '../../../components/common/LoadingState';
import MentorStats from '../../../components/admin/KelolaMentor/MentorStats';
import MentorDetailModal from '../../../components/admin/KelolaMentor/MentorDetailModal';
import MentorDeleteModal from '../../../components/admin/KelolaMentor/MentorDeleteModal';
import MentorBulkDeleteModal from '../../../components/admin/KelolaMentor/MentorBulkDeleteModal';
import MentorImportModal from '../../../components/admin/KelolaMentor/MentorImportModal';
import { importMentors } from '../../../api/mentorImport';

const KelolaMentor = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMentors, setSelectedMentors] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total_mentors: 0,
    active_mentors: 0,
    inactive_mentors: 0,
    mentors_by_gender: []
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [blockingMentors, setBlockingMentors] = useState(new Set());

  useEffect(() => {
    fetchMentors(currentPage);
    fetchStats();
  }, [currentPage, filters]);

  const fetchMentors = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        per_page: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.status && { status: filters.status })
      };
      const response = await api.get('/mentors', { params });
      setMentors(response.data.data || []);
      setPagination(response.data.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Gagal memuat data mentor');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/mentors/stats');
      console.log('Stats response:', response.data);
      setStats(response.data.data || {
        total_mentors: 0,
        active_mentors: 0,
        inactive_mentors: 0,
        mentors_by_gender: []
      });
    } catch (error) {
      console.error('Error fetching mentor stats:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/mentors/${selectedMentor.id}`);
      toast.success('Mentor berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedMentor(null);
      fetchMentors(currentPage);
      fetchStats();
    } catch (error) {
      toast.error('Gagal menghapus mentor');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedMentors.map(id => api.delete(`/mentors/${id}`)));
      toast.success(`${selectedMentors.length} mentor berhasil dihapus`);
      setShowBulkDeleteModal(false);
      setSelectedMentors([]);
      fetchMentors(currentPage);
      fetchStats();
    } catch (error) {
      toast.error('Gagal menghapus mentor');
    }
  };

  const handleBlockMentor = async (mentor) => {
    setBlockingMentors(prev => new Set(prev).add(mentor.id));
    
    try {
      await blockMentor(mentor.id);
      // Optimistic update
      const updatedMentors = mentors.map(m => 
        m.id === mentor.id ? { ...m, blocked_at: new Date().toISOString() } : m
      );
      setMentors(updatedMentors);
      toast.success(`Mentor ${mentor.profile?.full_name || mentor.email} berhasil diblokir`);
      fetchStats();
    } catch (error) {
      toast.error('Gagal memblokir mentor');
    } finally {
      setBlockingMentors(prev => {
        const newSet = new Set(prev);
        newSet.delete(mentor.id);
        return newSet;
      });
    }
  };

  const handleUnblockMentor = async (mentor) => {
    setBlockingMentors(prev => new Set(prev).add(mentor.id));
    
    try {
      await unblockMentor(mentor.id);
      // Optimistic update
      const updatedMentors = mentors.map(m => 
        m.id === mentor.id ? { ...m, blocked_at: null } : m
      );
      setMentors(updatedMentors);
      toast.success(`Mentor ${mentor.profile?.full_name || mentor.email} berhasil dibuka blokirnya`);
      fetchStats();
    } catch (error) {
      toast.error('Gagal membuka blokir mentor');
    } finally {
      setBlockingMentors(prev => {
        const newSet = new Set(prev);
        newSet.delete(mentor.id);
        return newSet;
      });
    }
  };

  const handleSelectMentor = (mentorId) => {
    setSelectedMentors(prev => 
      prev.includes(mentorId) 
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMentors.length === mentors.length) {
      setSelectedMentors([]);
    } else {
      setSelectedMentors(mentors.map(mentor => mentor.id));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors(currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      if (validTypes.includes(file.type)) {
        setUploadFile(file);
        setShowImportModal(true);
      } else {
        toast.error('File harus berformat Excel (.xlsx, .xls) atau CSV');
        e.target.value = '';
      }
    }
  };

  const handleImportExcel = async () => {
    if (!uploadFile) return;
    
    try {
      setImportLoading(true);
      const result = await importMentors(uploadFile);
      
      if (result.status === 'success') {
        const failureCount = result.failures_count || 0;
        
        if (failureCount > 0) {
          // Tampilkan setiap error dalam toast terpisah
          result.failures.forEach(failure => {
            failure.errors.forEach(error => {
              toast.error(`Baris ${failure.row}: ${error}`, {
                duration: 6000
              });
            });
          });
          
          toast.success(`${result.message} (${failureCount} baris gagal)`);
        } else {
          toast.success(result.message);
        }
        
        setUploadFile(null);
        setShowImportModal(false);
        fetchMentors(currentPage);
        fetchStats();
        document.getElementById('excel-upload').value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal import data mentor');
    } finally {
      setImportLoading(false);
    }
  };



  return (
    <Layout activeMenu="Kelola Mentor">
      <div className="p-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kelola Mentor
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola data mentor dalam sistem
            </p>
          </div>
          
          <div className="flex space-x-3">
            {selectedMentors.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} />
                <span>Hapus ({selectedMentors.length})</span>
              </button>
            )}
            <div className="relative">
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('excel-upload').click()}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
                  isDark ? 'border-green-600 text-green-400 hover:bg-green-900/20' : 'border-green-300 text-green-700 hover:bg-green-50'
                } transition-colors`}
              >
                <Upload size={20} />
                <span>Import Excel</span>
              </button>
            </div>
            <button
              onClick={() => navigate('/admin/kelola-mentor/recycle-bin')}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              <Trash2 size={20} />
              <span>Recycle Bin</span>
            </button>
            <button
              onClick={() => navigate('/admin/kelola-mentor/tambah')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus size={20} />
              <span>Tambah Mentor</span>
            </button>
          </div>
        </motion.div>

        {/* Filter & Search */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className={isDark ? 'text-white' : 'text-gray-800'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filter & Pencarian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Cari nama, email, telepon..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Semua Gender</option>
              <option value="Ikhwan">Ikhwan (Laki-laki)</option>
              <option value="Akhwat">Akhwat (Perempuan)</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>
        </motion.div>

        {/* Stats */}
        <MentorStats stats={stats} />

        {/* Table */}
        <motion.div 
          className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <input
                      type="checkbox"
                      checked={selectedMentors.length === mentors.length && mentors.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    No
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Mentor
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Kontak
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Kelompok
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Kontrol
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4">
                      <LoadingState type="dots" size="md" text="Memuat data mentor..." />
                    </td>
                  </tr>
                ) : mentors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tidak ada data mentor
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor, index) => (
                    <motion.tr
                      key={mentor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <input
                          type="checkbox"
                          checked={selectedMentors.includes(mentor.id)}
                          onChange={() => handleSelectMentor(mentor.id)}
                          className="rounded"
                        />
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {((pagination.current_page - 1) * pagination.per_page) + index + 1}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                            <div className="font-medium">{mentor.profile?.full_name || mentor.email}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {mentor.profile?.nickname || '-'} • {mentor.profile?.gender || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail size={14} className="mr-1" />
                            {mentor.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone size={14} className="mr-1" />
                            {mentor.profile?.phone_number || '-'}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className="text-sm">
                          <div>{mentor.groups_count || 0} kelompok</div>
                          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {mentor.mentees_count || 0} mentee
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          mentor.blocked_at
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : (mentor.profile?.status || 'Aktif') === 'Aktif' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            mentor.blocked_at
                              ? 'bg-red-500'
                              : (mentor.profile?.status || 'Aktif') === 'Aktif'
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`} />
                          {mentor.blocked_at ? 'Terblokir' : (mentor.profile?.status || 'Aktif')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => mentor.blocked_at ? handleUnblockMentor(mentor) : handleBlockMentor(mentor)}
                          disabled={blockingMentors.has(mentor.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                            blockingMentors.has(mentor.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : mentor.blocked_at
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          {blockingMentors.has(mentor.id) && (
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>{mentor.blocked_at ? 'Unblock' : 'Block'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {setSelectedMentor(mentor); setShowDetailModal(true);}}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Detail"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/kelola-mentor/edit/${mentor.id}`)}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {setSelectedMentor(mentor); setShowDeleteModal(true);}}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className={`px-6 py-3 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.current_page === 1 
                        ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Sebelumnya
                  </button>
                  
                  {[...Array(pagination.last_page)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.last_page ||
                      (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded ${
                            page === pagination.current_page
                              ? 'bg-blue-500 text-white'
                              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.current_page - 2 ||
                      page === pagination.current_page + 2
                    ) {
                      return <span key={page} className={`px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`px-3 py-1 rounded ${
                      pagination.current_page === pagination.last_page 
                        ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <MentorDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        mentor={selectedMentor}
      />

      {/* Delete Modal */}
      <MentorDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        mentor={selectedMentor}
      />

      {/* Bulk Delete Modal */}
      <MentorBulkDeleteModal
        show={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        selectedCount={selectedMentors.length}
      />

      {/* Import Mentor Modal */}
      <MentorImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setUploadFile(null);
          document.getElementById('excel-upload').value = '';
        }}
        onConfirm={handleImportExcel}
        fileName={uploadFile?.name}
        loading={importLoading}
      />
    </Layout>
  );
};

export default KelolaMentor;