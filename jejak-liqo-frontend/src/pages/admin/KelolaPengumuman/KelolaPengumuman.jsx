import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { Plus, Search, Filter, Archive, Megaphone, Trash2, CheckSquare, Square } from 'lucide-react';
import BulkDeleteModal from '../../../components/admin/KelolaPengumuman/BulkDeleteModal';
import { toast } from 'react-hot-toast';
import AnnouncementStats from '../../../components/admin/KelolaPengumuman/AnnouncementStats';
import AnnouncementCard from '../../../components/admin/KelolaPengumuman/AnnouncementCard';
import DetailModal from '../../../components/admin/KelolaPengumuman/DetailModal';
import DeleteConfirmModal from '../../../components/admin/KelolaPengumuman/DeleteConfirmModal';
import LoadingState from '../../../components/common/LoadingState';

const KelolaPengumuman = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, [pagination.current_page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:8000/api/announcements?${params}`, {
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
        toast.error('Gagal memuat data pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Gagal memuat data pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/announcements/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailModal(true);
  };

  const handleEdit = (announcement) => {
    navigate(`/admin/kelola-pengumuman/edit/${announcement.id}`);
  };

  const handleDelete = (announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!announcementToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/announcements/${announcementToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Pengumuman berhasil dihapus');
        setShowDeleteModal(false);
        setAnnouncementToDelete(null);
        fetchAnnouncements();
        fetchStats();
      } else {
        toast.error('Gagal menghapus pengumuman');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Gagal menghapus pengumuman');
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handleSelectAnnouncement = (announcementId) => {
    setSelectedAnnouncements(prev => 
      prev.includes(announcementId)
        ? prev.filter(id => id !== announcementId)
        : [...prev, announcementId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnnouncements.length === announcements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(announcements.map(a => a.id));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const deletePromises = selectedAnnouncements.map(id => 
        fetch(`http://localhost:8000/api/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedAnnouncements.length} pengumuman berhasil dihapus`);
      setSelectedAnnouncements([]);
      setShowBulkDelete(false);
      fetchAnnouncements();
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting announcements:', error);
      toast.error('Gagal menghapus beberapa pengumuman');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <Layout activeMenu="Kelola Pengumuman">
      <div className="p-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <Megaphone size={32} className="text-blue-600" />
              Kelola Pengumuman
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola pengumuman dengan sistem penjadwalan otomatis
            </p>
          </div>
          
          <div className="flex space-x-3">
            {selectedAnnouncements.length > 0 && (
              <button
                onClick={() => setShowBulkDelete(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <Trash2 size={20} />
                <span>Hapus ({selectedAnnouncements.length})</span>
              </button>
            )}
            
            <button
              onClick={() => navigate('/admin/kelola-pengumuman/arsip')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Archive size={20} />
              <span>Arsip</span>
            </button>
            
            <button
              onClick={() => navigate('/admin/kelola-pengumuman/trash')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Trash2 size={20} />
              <span>Trash</span>
            </button>
            
            <button
              onClick={() => navigate('/admin/kelola-pengumuman/tambah')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus size={20} />
              <span>Buat Pengumuman</span>
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <AnnouncementStats stats={stats} />

        {/* Search & Filter */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
                placeholder="Cari judul atau konten pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="scheduled">Terjadwal</option>
              <option value="expired">Berakhir</option>
            </select>
            
            {announcements.length > 0 && (
              <button
                onClick={handleSelectAll}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {selectedAnnouncements.length === announcements.length ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} />
                )}
                <span className="text-sm">
                  {selectedAnnouncements.length === announcements.length ? 'Batal Pilih' : 'Pilih Semua'}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingState type="dots" size="md" text="Memuat pengumuman..." />
          </div>
        ) : announcements.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada pengumuman</h3>
            <p>Mulai buat pengumuman pertama Anda</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {announcements.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSelected={selectedAnnouncements.includes(announcement.id)}
                onSelect={handleSelectAnnouncement}
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
        
        {/* Modals */}
        <BulkDeleteModal
          isOpen={showBulkDelete}
          onClose={() => setShowBulkDelete(false)}
          selectedCount={selectedAnnouncements.length}
          onConfirm={handleBulkDelete}
          loading={bulkDeleting}
        />
        
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAnnouncement(null);
          }}
          announcement={selectedAnnouncement}
        />
        
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setAnnouncementToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          announcement={announcementToDelete}
          loading={deleting}
        />
      </div>
    </Layout>
  );
};

export default KelolaPengumuman;