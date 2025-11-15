import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Search, Trash2, RotateCcw, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingState from '../../../components/common/LoadingState';

const TrashCard = ({ announcement, onRestore, onForceDelete, index = 0 }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700 opacity-75' 
          : 'bg-white border-gray-200 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>{announcement.title}</h3>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <span>Dihapus: {formatDate(announcement.deleted_at)} - {formatTime(announcement.deleted_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold ${
            isDark ? 'shadow-lg' : 'shadow-md'
          }`}>
            <Trash2 size={20} />
          </div>
        </div>
      </div>
      
      <div className={`mb-4 p-4 rounded-xl ${
        isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'
      }`}>
        <p className={`text-sm line-clamp-3 leading-relaxed ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>{announcement.content?.substring(0, 150)}...</p>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => onRestore(announcement)}
          className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            isDark 
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <RotateCcw size={16} />
          <span>Pulihkan</span>
        </button>
        
        <button
          onClick={() => onForceDelete(announcement)}
          className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            isDark 
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <X size={16} />
          <span>Hapus Permanen</span>
        </button>
      </div>
    </motion.div>
  );
};

const TrashPengumuman = () => {
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
    fetchTrashedAnnouncements();
  }, [pagination.current_page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrashedAnnouncements();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTrashedAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:8000/api/announcements/trashed?${params}`, {
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
        toast.error('Gagal memuat data trash');
      }
    } catch (error) {
      console.error('Error fetching trashed announcements:', error);
      toast.error('Gagal memuat data trash');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (announcement) => {
    if (window.confirm('Apakah Anda yakin ingin memulihkan pengumuman ini?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/announcements/${announcement.id}/restore`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast.success('Pengumuman berhasil dipulihkan');
          fetchTrashedAnnouncements();
        } else {
          toast.error('Gagal memulihkan pengumuman');
        }
      } catch (error) {
        console.error('Error restoring announcement:', error);
        toast.error('Gagal memulihkan pengumuman');
      }
    }
  };

  const handleForceDelete = async (announcement) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus permanen pengumuman ini? Tindakan ini tidak dapat dibatalkan!')) {
      try {
        const response = await fetch(`http://localhost:8000/api/announcements/${announcement.id}/force`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast.success('Pengumuman berhasil dihapus permanen');
          fetchTrashedAnnouncements();
        } else {
          toast.error('Gagal menghapus pengumuman');
        }
      } catch (error) {
        console.error('Error force deleting announcement:', error);
        toast.error('Gagal menghapus pengumuman');
      }
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
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
              <Trash2 size={32} className="text-red-600" />
              Trash Pengumuman
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola pengumuman yang telah dihapus
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
              placeholder="Cari pengumuman yang dihapus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            />
          </div>
        </motion.div>

        {/* Trash Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingState type="dots" size="md" text="Memuat trash..." />
          </div>
        ) : announcements.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Trash2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Trash kosong</h3>
            <p>Tidak ada pengumuman yang dihapus</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {announcements.map((announcement, index) => (
              <TrashCard
                key={announcement.id}
                announcement={announcement}
                onRestore={handleRestore}
                onForceDelete={handleForceDelete}
                index={index}
              />
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
                    : 'bg-red-500 text-white hover:bg-red-600'
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
                          ? 'bg-red-500 text-white'
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
                    : 'bg-red-500 text-white hover:bg-red-600'
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

export default TrashPengumuman;