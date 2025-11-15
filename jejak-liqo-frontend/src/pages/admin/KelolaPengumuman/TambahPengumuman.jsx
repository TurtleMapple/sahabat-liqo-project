import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Save, Calendar, FileText } from 'lucide-react';
import FileDropzone from '../../../components/admin/KelolaPengumuman/FileDropzone';
import RichTextEditor from '../../../components/admin/KelolaPengumuman/RichTextEditor';
import { toast } from 'react-hot-toast';

const TambahPengumuman = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    event_at: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('event_at', formData.event_at);
      
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      const response = await fetch('http://localhost:8000/api/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        toast.success('Pengumuman berhasil dibuat');
        navigate('/admin/kelola-pengumuman');
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        toast.error(errorData.message || 'Gagal membuat pengumuman');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Gagal membuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
              <FileText size={32} className="text-blue-600" />
              Buat Pengumuman Baru
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Buat pengumuman dengan sistem penjadwalan otomatis
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
                  min={formatDateForInput()}
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
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Pengumuman akan aktif pada tanggal dan waktu yang ditentukan
              </p>
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
              <FileDropzone
                onFileSelect={(file) => setFormData(prev => ({ ...prev, file }))}
                selectedFile={formData.file}
                onRemoveFile={() => setFormData(prev => ({ ...prev, file: null }))}
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
                disabled={loading}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Save size={20} />
                <span>{loading ? 'Menyimpan...' : 'Simpan Pengumuman'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TambahPengumuman;