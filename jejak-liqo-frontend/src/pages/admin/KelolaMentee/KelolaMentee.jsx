import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import api from '../../../api/axiosInstance';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import MenteeStats from '../../../components/admin/KelolaMentee/MenteeStats';
import MenteeDetailModal from '../../../components/admin/KelolaMentee/MenteeDetailModal';
import MenteeDeleteModal from '../../../components/admin/KelolaMentee/MenteeDeleteModal';
import MenteeBulkDeleteModal from '../../../components/admin/KelolaMentee/MenteeBulkDeleteModal';
import LoadingState from '../../../components/common/LoadingState';

const KelolaMentee = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);


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
  const [genderStats, setGenderStats] = useState({
    totalIkhwan: 0,
    activeIkhwan: 0,
    totalAkhwat: 0,
    activeAkhwat: 0
  });

  useEffect(() => {
    fetchMentees(currentPage);
    fetchGenderStats();
  }, [currentPage, filters]);

  const fetchMentees = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        per_page: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.status && { status: filters.status })
      };
      const response = await api.get('/mentees', { params });
      setMentees(response.data.data || []);
      setPagination(response.data.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error('Gagal memuat data mentee');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenderStats = async () => {
    try {
      // Menggunakan endpoint stats yang sudah ada
      const response = await api.get('/mentees/stats');
      const stats = response.data.data || {};
      
      setGenderStats({
        totalIkhwan: stats.total_ikhwan || 0,
        activeIkhwan: stats.active_ikhwan || 0,
        totalAkhwat: stats.total_akhwat || 0,
        activeAkhwat: stats.active_akhwat || 0
      });
    } catch (error) {
      console.error('Error fetching gender stats:', error);
      // Fallback ke method lama jika endpoint stats belum ada
      try {
        const [ikhwanResponse, akhwatResponse] = await Promise.all([
          api.get('/mentees', { params: { gender: 'Ikhwan', status: 'Aktif' } }),
          api.get('/mentees', { params: { gender: 'Akhwat', status: 'Aktif' } })
        ]);
        
        const [totalIkhwanResponse, totalAkhwatResponse] = await Promise.all([
          api.get('/mentees', { params: { gender: 'Ikhwan' } }),
          api.get('/mentees', { params: { gender: 'Akhwat' } })
        ]);
        
        setGenderStats({
          totalIkhwan: totalIkhwanResponse.data.pagination?.total || 0,
          activeIkhwan: ikhwanResponse.data.pagination?.total || 0,
          totalAkhwat: totalAkhwatResponse.data.pagination?.total || 0,
          activeAkhwat: akhwatResponse.data.pagination?.total || 0
        });
      } catch (fallbackError) {
        console.error('Error with fallback stats:', fallbackError);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/mentees/${selectedMentee.id}`);
      toast.success('Mentee berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedMentee(null);
      fetchMentees(currentPage);
      fetchGenderStats();
    } catch (error) {
      toast.error('Gagal menghapus mentee');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.post('/mentees/bulk-delete', { mentee_ids: selectedMentees });
      toast.success(`${selectedMentees.length} mentee berhasil dihapus`);
      setShowBulkDeleteModal(false);
      setSelectedMentees([]);
      fetchMentees(currentPage);
      fetchGenderStats();
    } catch (error) {
      toast.error('Gagal menghapus mentee');
    }
  };

  const handleSelectMentee = (menteeId) => {
    setSelectedMentees(prev => 
      prev.includes(menteeId) 
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMentees.length === mentees.length) {
      setSelectedMentees([]);
    } else {
      setSelectedMentees(mentees.map(mentee => mentee.id));
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
      fetchMentees(currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <Layout activeMenu="Kelola Mentee">
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
              Kelola Mentee
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola data mentee dalam sistem
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin/kelola-mentee/recycle-bin')}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              <Trash2 size={20} />
              <span>Recycle Bin</span>
            </button>
            {selectedMentees.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} />
                <span>Hapus ({selectedMentees.length})</span>
              </button>
            )}
            <button
              onClick={() => navigate('/admin/kelola-mentee/tambah')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus size={20} />
              <span>Tambah Mentee</span>
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
                placeholder="Cari nama, panggilan, telepon, kelas..."
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
              <option value="">Semua Mentee</option>
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
        <MenteeStats genderStats={genderStats} />

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
                      checked={selectedMentees.length === mentees.length && mentees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    No
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Nama
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Telepon
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Kelas
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Kelompok
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
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
                      <LoadingState type="dots" size="md" text="Memuat data mentee..." />
                    </td>
                  </tr>
                ) : mentees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tidak ada data mentee
                    </td>
                  </tr>
                ) : (
                  mentees.map((mentee, index) => (
                    <motion.tr
                      key={mentee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <input
                          type="checkbox"
                          checked={selectedMentees.includes(mentee.id)}
                          onChange={() => handleSelectMentee(mentee.id)}
                          className="rounded"
                        />
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {((pagination.current_page - 1) * pagination.per_page) + index + 1}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{mentee.full_name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {mentee.nickname}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.phone_number || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.activity_class || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.group_id ? (
                          mentee.group ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              mentee.gender === 'Ikhwan' 
                                ? (isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800')
                                : (isDark ? 'bg-pink-900/20 text-pink-400' : 'bg-pink-100 text-pink-800')
                            }`}>
                              {mentee.group.group_name}
                            </span>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isDark ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-800'
                            }`}>
                              Kelompok ID: {mentee.group_id}
                            </span>
                          )
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Belum ada kelompok
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mentee.status === 'Aktif' 
                            ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                            : isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'
                        }`}>
                          {mentee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {setSelectedMentee(mentee); setShowDetailModal(true);}}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Detail"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/kelola-mentee/edit/${mentee.id}`)}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {setSelectedMentee(mentee); setShowDeleteModal(true);}}
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
      <MenteeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        mentee={selectedMentee}
      />

      {/* Delete Modal */}
      <MenteeDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        mentee={selectedMentee}
      />

      {/* Bulk Delete Modal */}
      <MenteeBulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        selectedCount={selectedMentees.length}
      />
    </Layout>
  );
};

export default KelolaMentee;