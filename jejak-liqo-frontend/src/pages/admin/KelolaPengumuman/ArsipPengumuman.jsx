import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Search, Archive, Eye, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../../../components/admin/KelolaPengumuman/StatusBadge';
import LoadingState from '../../../components/common/LoadingState';

const ArsipPengumuman = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  });

  useEffect(() => {
    fetchArchivedAnnouncements();
  }, [pagination.current_page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArchivedAnnouncements();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchArchivedAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:8000/api/announcements/archived?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data?.data || []);
        setPagination(prev => ({
          ...prev,
          current_page: data.data?.current_page || 1,
          last_page: data.data?.last_page || 1,
          total: data.data?.total || 0
        }));
      } else {
        toast.error('Gagal memuat arsip pengumuman');
      }
    } catch (error) {
      console.error('Error fetching archived announcements:', error);
      toast.error('Gagal memuat arsip pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (announcement) => {
    navigate(`/admin/kelola-pengumuman/detail/${announcement.id}`);
  };

  const handleDelete = async (announcement) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/announcements/${announcement.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast.success('Pengumuman berhasil dihapus');
          fetchArchivedAnnouncements();
        } else {
          toast.error('Gagal menghapus pengumuman');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Gagal menghapus pengumuman');
      }
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  return (
    <Layout activeMenu="Kelola Pengumuman">
      <div className="p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center space-x-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button
            onClick={() => navigate('/admin/kelola-pengumuman')}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors`}
          >
            <ArrowLeft size={20} className={isDark ? 'text-white' : 'text-gray-600'} />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <Archive size={32} className="text-red-600" />
              Arsip Pengumuman
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Pengumuman yang sudah berakhir atau expired
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
              placeholder="Cari pengumuman yang diarsipkan..."
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

        {/* Archived Announcements */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingState type="dots" size="md" text="Memuat arsip pengumuman..." />
          </div>
        ) : announcements.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada pengumuman yang diarsipkan</h3>
            <p>Pengumuman yang sudah berakhir akan muncul di sini</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl shadow-sm border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                } transition-all duration-200 opacity-75`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <StatusBadge eventAt={announcement.event_at} />
                      {announcement.file_path && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Archive size={10} />
                          File
                        </span>
                      )}
                    </div>

                    {/* Title & Content */}
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {announcement.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      {truncateContent(announcement.content)}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Berakhir: {formatDate(announcement.event_at)}
                        </span>
                      </div>
                      <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {announcement.user?.profile?.full_name || announcement.user?.email || 'Admin'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleView(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10' 
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Lihat detail"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Hapus permanen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex justify-center mt-8">
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
        )}
      </div>
    </Layout>
  );
};

export default ArsipPengumuman;