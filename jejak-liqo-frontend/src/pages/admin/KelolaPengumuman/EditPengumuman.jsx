import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Save, Calendar, FileText } from 'lucide-react';
import FileManager from '../../../components/admin/KelolaPengumuman/FileManager';
import RichTextEditor from '../../../components/admin/KelolaPengumuman/RichTextEditor';
import { toast } from 'react-hot-toast';
import LoadingState from '../../../components/common/LoadingState';

const EditPengumuman = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    event_at: '',
    file: null,
    existing_file: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
        const announcement = data.data;
        
        // Format datetime for input
        const eventDate = new Date(announcement.event_at);
        const formattedDate = eventDate.toISOString().slice(0, 16);
        
        setFormData({
          title: announcement.title || '',
          content: announcement.content || '',
          event_at: formattedDate,
          file: null,
          existing_file: announcement.file_path ? {
            path: announcement.file_path,
            type: announcement.file_type,
            name: announcement.file_path.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_/, '')
          } : null
        });
      } else {
        toast.error('Gagal memuat data pengumuman');
        navigate('/admin/kelola-pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      toast.error('Gagal memuat data pengumuman');
      navigate('/admin/kelola-pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };



  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Judul pengumuman wajib diisi';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Konten pengumuman wajib diisi';
    }
    
    if (!formData.event_at) {
      newErrors.event_at = 'Tanggal aktif pengumuman wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setSaving(true);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('event_at', formData.event_at);
      submitData.append('_method', 'PUT');
      
      if (formData.file) {
        submitData.append('file', formData.file);
      }
      
      // If existing file is removed
      if (!formData.existing_file && !formData.file) {
        submitData.append('remove_file', '1');
      }

      const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        toast.success('Pengumuman berhasil diperbarui');
        navigate('/admin/kelola-pengumuman');
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        toast.error(errorData.message || 'Gagal memperbarui pengumuman');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Gagal memperbarui pengumuman');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout activeMenu="Kelola Pengumuman">
        <div className="flex justify-center items-center min-h-screen">
          <LoadingState type="dots" size="lg" text="Memuat data pengumuman..." />
        </div>
      </Layout>
    );
  }

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
              <FileText size={32} className="text-blue-600" />
              Edit Pengumuman
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Perbarui informasi pengumuman
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Judul Pengumuman *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Masukkan judul pengumuman..."
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.title
                    ? 'border-red-500 focus:ring-red-500'
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                } focus:ring-2 focus:border-transparent`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Event Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Tanggal & Waktu Aktif *
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                <input
                  type="datetime-local"
                  name="event_at"
                  value={formData.event_at}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    errors.event_at
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } focus:ring-2 focus:border-transparent`}
                />
              </div>
              {errors.event_at && (
                <p className="text-red-500 text-sm mt-1">{errors.event_at}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Konten Pengumuman *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Tulis konten pengumuman di sini..."
                error={errors.content}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Lampiran File (Opsional)
              </label>
              <FileManager
                existingFile={formData.existing_file}
                newFile={formData.file}
                onFileSelect={(file) => setFormData(prev => ({ ...prev, file }))}
                onRemoveNewFile={() => setFormData(prev => ({ ...prev, file: null }))}
                onRemoveExistingFile={() => setFormData(prev => ({ ...prev, existing_file: null }))}
                maxSize={10}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/kelola-pengumuman')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Save size={20} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EditPengumuman;