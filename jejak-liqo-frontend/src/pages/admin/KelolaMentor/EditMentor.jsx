import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import LoadingState from '../../../components/common/LoadingState';

const EditMentor = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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
    status_note: '',
    profile_picture: ''
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMentor();
  }, [id]);

  const fetchMentor = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/mentors/${id}`);
      const mentor = response.data.data;
      setFormData({
        email: mentor.email || '',
        password: '',
        full_name: mentor.profile?.full_name || '',
        gender: mentor.profile?.gender || '',
        nickname: mentor.profile?.nickname || '',
        birth_date: mentor.profile?.birth_date || '',
        phone_number: mentor.profile?.phone_number || '',
        hobby: mentor.profile?.hobby || '',
        address: mentor.profile?.address || '',
        job: mentor.profile?.job || '',
        status: mentor.profile?.status || 'Aktif',
        status_note: mentor.profile?.status_note || '',
        profile_picture: mentor.profile?.profile_picture || ''
      });
      setProfilePicturePreview(mentor.profile?.profile_picture ? `http://127.0.0.1:8000/storage/${mentor.profile.profile_picture}` : null);
    } catch (error) {
      console.error('Error fetching mentor:', error);
      toast.error('Gagal memuat data mentor');
      navigate('/admin/kelola-mentor');
    } finally {
      setFetchLoading(false);
    }
  };

  const validateMentor = (mentor) => {
    const errors = {};
    
    if (!mentor.email || mentor.email.trim() === '') {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(mentor.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!mentor.full_name || mentor.full_name.trim() === '') {
      errors.full_name = 'Nama lengkap wajib diisi';
    }
    
    if (mentor.full_name && mentor.full_name.length > 255) {
      errors.full_name = 'Nama lengkap maksimal 255 karakter';
    }
    
    if (mentor.password && mentor.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
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
      
      // Debug: Log form data sebelum submit
      console.log('Form Data before submit:', formData);
      console.log('Email value:', formData.email);
      console.log('Full name value:', formData.full_name);
      
      const submitData = new FormData();
      
      // Add _method for Laravel to handle PUT with FormData
      submitData.append('_method', 'PUT');
      
      // Append all form fields except profile_picture and empty password
      Object.keys(formData).forEach(key => {
        if (key === 'password' && (!formData[key] || formData[key].trim() === '')) {
          return; // Skip empty password
        }
        if (key !== 'profile_picture') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append profile picture file if new file is selected
      if (profilePictureFile) {
        submitData.append('profile_picture', profilePictureFile);
      }
      
      await api.post(`/mentors/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Mentor berhasil diperbarui');
      navigate('/admin/kelola-mentor');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Gagal memperbarui mentor');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout activeMenu="Kelola Mentor">
        <div className="p-6">
          <LoadingState type="form" text="Memuat data mentor..." />
        </div>
      </Layout>
    );
  }

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
                Edit Mentor
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Mentor → Edit Mentor
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
                        Password Baru (Opsional)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Kosongkan jika tidak ingin mengubah"
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
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium ${
                          profilePicturePreview ? 'hidden' : 'flex'
                        }`}>
                          {formData.full_name?.charAt(0) || '?'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setProfilePictureFile(file);
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setProfilePicturePreview(e.target.result);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              setProfilePictureFile(null);
                              setProfilePicturePreview(formData.profile_picture ? `http://127.0.0.1:8000/storage/${formData.profile_picture}` : null);
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                        />
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Pilih file gambar (JPG, PNG, GIF) atau kosongkan untuk menggunakan inisial nama
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
                        Jenis Kelamin
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Ikhwan">Ikhwan (Laki-laki)</option>
                        <option value="Akhwat">Akhwat (Perempuan)</option>
                      </select>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>

                  {formData.status === 'Non-Aktif' && (
                    <div className="mt-4">
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Catatan Status Non-Aktif
                      </label>
                      <textarea
                        value={formData.status_note}
                        onChange={(e) => setFormData({ ...formData, status_note: e.target.value })}
                        placeholder="Alasan mengapa mentor diubah menjadi non-aktif..."
                        rows="3"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Catatan ini akan membantu admin memahami alasan status non-aktif
                      </p>
                    </div>
                  )}

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
                      'Update Mentor'
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

export default EditMentor;