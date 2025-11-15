import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Edit, Trash2, Download, User, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../../../components/admin/KelolaPengumuman/StatusBadge';
import LoadingState from '../../../components/common/LoadingState';
import MDEditor from '@uiw/react-md-editor';

const DetailPengumuman = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data.data);
      } else {
        toast.error('Gagal memuat detail pengumuman');
        navigate('/admin/kelola-pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      toast.error('Gagal memuat detail pengumuman');
      navigate('/admin/kelola-pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast.success('Pengumuman berhasil dihapus');
          navigate('/admin/kelola-pengumuman');
        } else {
          toast.error('Gagal menghapus pengumuman');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Gagal menghapus pengumuman');
      }
    }
  };

  const handleDownload = () => {
    if (announcement?.file_path) {
      const fileUrl = `http://localhost:8000/storage/${announcement.file_path}`;
      window.open(fileUrl, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout activeMenu="Kelola Pengumuman">
        <div className="flex justify-center items-center min-h-screen">
          <LoadingState type="dots" size="lg" text="Memuat detail pengumuman..." />
        </div>
      </Layout>
    );
  }

  if (!announcement) {
    return (
      <Layout activeMenu="Kelola Pengumuman">
        <div className="p-6">
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Pengumuman tidak ditemukan</h3>
            <button
              onClick={() => navigate('/admin/kelola-pengumuman')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Kembali ke daftar pengumuman
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="Kelola Pengumuman">
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
              onClick={() => navigate('/admin/kelola-pengumuman')}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors`}
            >
              <ArrowLeft size={20} className={isDark ? 'text-white' : 'text-gray-600'} />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                <FileText size={32} className="text-blue-600" />
                Detail Pengumuman
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Lihat detail lengkap pengumuman
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/admin/kelola-pengumuman/edit/${announcement.id}`)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              <Edit size={20} />
              <span>Edit</span>
            </button>
            
            <button
              onClick={handleDelete}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Trash2 size={20} />
              <span>Hapus</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className="p-6">
            {/* Status & Meta Info */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <StatusBadge eventAt={announcement.event_at} />
                {announcement.file_path && (
                  <button
                    onClick={handleDownload}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
                      isDark 
                        ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Download size={12} />
                    Unduh Lampiran
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {announcement.title}
            </h2>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Dibuat oleh:</strong> {announcement.user?.profile?.full_name || announcement.user?.email || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Tanggal Aktif:</strong> {formatDate(announcement.event_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Dibuat pada:</strong> {formatDate(announcement.created_at)}
                </span>
              </div>
              {announcement.updated_at !== announcement.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Terakhir diubah:</strong> {formatDate(announcement.updated_at)}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Konten Pengumuman
              </h3>
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700/30 border-gray-600 text-gray-300' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}>
                <style>{`
                  .rich-content h1 {
                    font-size: 1.875rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    color: ${isDark ? '#ffffff' : '#1f2937'};
                  }
                  .rich-content h2 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 0.75rem;
                    color: ${isDark ? '#ffffff' : '#1f2937'};
                  }
                  .rich-content h3 {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                    color: ${isDark ? '#ffffff' : '#1f2937'};
                  }
                  .rich-content strong {
                    font-weight: bold;
                  }
                  .rich-content em {
                    font-style: italic;
                  }
                  .rich-content u {
                    text-decoration: underline;
                  }
                  .rich-content ol {
                    list-style-type: decimal;
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .rich-content ul {
                    list-style-type: disc;
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .rich-content li {
                    margin-bottom: 0.25rem;
                  }
                  .rich-content a {
                    color: #3b82f6;
                    text-decoration: underline;
                  }
                  .rich-content a:hover {
                    color: #1d4ed8;
                  }
                  .rich-content p {
                    margin-bottom: 1rem;
                  }
                `}</style>
                <div className={`rich-content leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MDEditor.Markdown 
                    source={announcement.content} 
                    style={{ 
                      backgroundColor: 'transparent',
                      color: isDark ? '#D1D5DB' : '#374151'
                    }}
                    components={{
                      a: ({ href, children, ...props }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                          {children}
                        </a>
                      )
                    }}
                  />
                </div>
              </div>
            </div>

            {/* File Information */}
            {announcement.file_path && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Lampiran File
                </h3>
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700/30 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {announcement.file_path.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_/, '')}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Tipe: {announcement.file_type || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownload}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <Download size={16} />
                      <span>Unduh</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DetailPengumuman;