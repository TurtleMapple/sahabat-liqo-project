import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, ArrowLeft, Camera, Upload } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import Sidebar from '../../../components/superadmin/Sidebar';
import Header from '../../../components/superadmin/Header';

const AddAdmin = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    nickname: '',
    phone: '',
    alamat: '',
    job: '',
    profile_status: 'Aktif',
    profile_picture: null,
    gender: '',
    status_note: '',
    birth_date: '',
    hobby: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_lengkap || !formData.email || !formData.password || !formData.gender) {
      toast.error('Nama lengkap, email, password, dan gender wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.nama_lengkap,
        nickname: formData.nickname || null,
        phone_number: formData.phone || null,
        address: formData.alamat || null,
        job: formData.job || null,
        status: 'Aktif',
        gender: formData.gender,
        status_note: formData.status_note || null,
        birth_date: formData.birth_date || null,
        hobby: formData.hobby || null
      };

      if (formData.profile_picture) {
        requestData.profile_picture = formData.profile_picture;
      }

      // Always use FormData for file uploads
      const finalData = new FormData();
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== null && requestData[key] !== '') {
          finalData.append(key, requestData[key]);
        }
      });
      
      if (formData.profile_picture) {
        finalData.append('profile_picture', formData.profile_picture);
      }

      const response = await api.post('/admins', finalData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success toast with admin name
      const adminName = formData.nama_lengkap;
      toast.success(`Admin "${adminName}" berhasil ditambahkan!`, {
        duration: 4000,
        icon: '✅'
      });
      
      // Redirect immediately
      navigate('/superadmin/kelola-admin');
    } catch (error) {
      console.error('Failed to add admin:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal menambahkan admin';

      // Check if email already exists - more comprehensive check
      const isEmailTaken = (
        error.response?.status === 422 ||
        error.response?.status === 409 ||
        errorMessage.toLowerCase().includes('email') && (
          errorMessage.toLowerCase().includes('already') ||
          errorMessage.toLowerCase().includes('exists') ||
          errorMessage.toLowerCase().includes('taken') ||
          errorMessage.toLowerCase().includes('sudah') ||
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('unique')
        ) ||
        (error.response?.data?.errors?.email && error.response.data.errors.email.some(err =>
          err.toLowerCase().includes('already') ||
          err.toLowerCase().includes('exists') ||
          err.toLowerCase().includes('taken') ||
          err.toLowerCase().includes('sudah') ||
          err.toLowerCase().includes('duplicate') ||
          err.toLowerCase().includes('unique')
        ))
      );

      if (isEmailTaken) {
        toast.error('Email sudah digunakan. Silakan gunakan email lain.', {
          duration: 5000,
          icon: '⚠️'
        });
      } else {
        toast.error(errorMessage, {
          duration: 4000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-[#4DABFF]/10 via-white to-[#4DABFF]/5'
    }`}>
      <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} activeMenu="Kelola Admin" />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-72'}`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/superadmin/kelola-admin')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-lg'
                } shadow-md`}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div>
                <h1 className={`text-3xl font-bold mb-1 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>Tambah Admin Baru</h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Tambahkan admin baru ke sistem Shaf Pembangunan</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Foto Profil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-xl border ${
                isDark ? 'bg-gray-800/95 border-gray-700/50' : 'bg-blue-50/50 border-blue-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Foto Profil</h3>
                <div className="flex items-start space-x-4">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({...formData, profile_picture: file});
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setPreviewImage(e.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="profile-picture-input"
                    />
                    <label htmlFor="profile-picture-input" className="cursor-pointer">
                      <div className={`relative w-32 h-32 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                        isDark ? 'bg-gradient-to-br from-blue-600 to-purple-700 shadow-lg shadow-blue-600/20' : 'bg-gradient-to-br from-[#4DABFF] to-blue-600 shadow-lg shadow-blue-500/20'
                      }`}>
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white">
                            <Upload size={32} className="mb-2" />
                            <span className="text-sm font-medium">Upload Foto</span>
                          </div>
                        )}
                        <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
                          <Camera size={24} className="text-white" />
                        </div>
                      </div>
                    </label>
                    {previewImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData({...formData, profile_picture: null});
                        }}
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                          isDark ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                        }`}
                      >
                        <Users size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Upload foto profil admin</p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Max 2MB • Format: JPEG, PNG, JPG, GIF</p>
                  </div>
              </div>
            </motion.div>

            {/* Form Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`p-6 rounded-xl border ${
                isDark ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Data Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="admin@jejakliqo.com"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Minimal 8 karakter"
                      minLength="8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-gray-300' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Pilih Gender</option>
                    <option value="Ikhwan">Ikhwan</option>
                    <option value="Akhwat">Akhwat</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Nama panggilan"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="+62 812-3456-7890"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={formData.job}
                    onChange={(e) => setFormData({...formData, job: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Administrator"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Hobi
                  </label>
                  <input
                    type="text"
                    value={formData.hobby}
                    onChange={(e) => setFormData({...formData, hobby: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Membaca, olahraga, dll"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Alamat
                  </label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/superadmin/kelola-admin')}
                  className={`flex-1 px-6 py-3 border rounded-xl font-medium transition-all duration-200 ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white rounded-xl font-medium hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    'Simpan Admin'
                  )}
                </motion.button>
            </motion.div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddAdmin;