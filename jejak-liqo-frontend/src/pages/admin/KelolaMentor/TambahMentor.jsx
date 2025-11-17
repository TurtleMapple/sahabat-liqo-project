import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import LoadingState from '../../../components/common/LoadingState';

const TambahMentor = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    gender: '',
    nickname: '',
    birth_date: '',
    phone_number: '',
    hobby: '',
    address: '',
    job: '',
    status: 'Aktif',
    profile_picture: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [errors, setErrors] = useState({});

  const validateMentor = (mentor) => {
    const errors = {};
    
    if (!mentor.email || mentor.email.trim() === '') {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(mentor.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!mentor.password || mentor.password.trim() === '') {
      errors.password = 'Password wajib diisi';
    } else if (mentor.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    
    if (!mentor.full_name || mentor.full_name.trim() === '') {
      errors.full_name = 'Nama lengkap wajib diisi';
    }
    
    if (mentor.full_name && mentor.full_name.length > 255) {
      errors.full_name = 'Nama lengkap maksimal 255 karakter';
    }
    
    if (!mentor.gender || mentor.gender.trim() === '') {
      errors.gender = 'Jenis kelamin wajib dipilih';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateMentor(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'profile_picture') {
          submitData.append(key, formData[key] || '');
        }
      });
      
      // Append profile picture file if exists
      if (profilePictureFile) {
        submitData.append('profile_picture', profilePictureFile);
      }
      
      await api.post('/mentors', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Mentor berhasil ditambahkan');
      navigate('/admin/kelola-mentor');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        // Tampilkan error spesifik di toast
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(message => {
          toast.error(message);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menambahkan mentor');
      }
    } finally {
      setLoading(false);
    }
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
                Tambah Mentor
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Mentor → Tambah Mentor
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div 
          className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Account Info */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
                    Informasi Akun
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="mentor@example.com"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Minimal 6 karakter"
                          className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          } transition-colors`}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
                    Informasi Pribadi
                  </h3>
                  
                  {/* Profile Picture */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Foto Profil
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {formData.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Validasi ukuran file (max 2MB)
                              if (file.size > 2048 * 1024) {
                                toast.error('Ukuran file tidak boleh lebih dari 2MB');
                                e.target.value = '';
                                return;
                              }
                              
                              setProfilePictureFile(file);
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setProfilePicturePreview(e.target.result);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              setProfilePictureFile(null);
                              setProfilePicturePreview(null);
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                        />
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Pilih file gambar (JPG, PNG, GIF) maksimal 2MB atau kosongkan untuk menggunakan inisial nama
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Masukkan nama lengkap mentor"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${
                          errors.full_name ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nama Panggilan
                      </label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        placeholder="Nama panggilan (opsional)"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${
                          errors.gender ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Ikhwan">Ikhwan (Laki-laki)</option>
                        <option value="Akhwat">Akhwat (Perempuan)</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Pekerjaan
                      </label>
                      <input
                        type="text"
                        value={formData.job}
                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                        placeholder="Guru, Dosen, dll"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hobi
                      </label>
                      <input
                        type="text"
                        value={formData.hobby}
                        onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
                        placeholder="Membaca, Olahraga, dll"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Alamat
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Alamat lengkap"
                        rows="3"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="grid grid-cols-2 gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-mentor')}
                    className={`w-full px-6 py-2 rounded-lg border ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Mentor'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TambahMentor;