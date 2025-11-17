import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Save, Eye, EyeOff, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/superadmin/Layout';
import { getAdminById, updateAdmin } from '../../../api/admin';

const EditAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    nickname: '',
    nomor_telepon: '',
    alamat: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    job: '',
    hobby: '',
    status: 'Aktif',
    status_note: '',
    foto_profil: null
  });

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDark(theme === 'dark');
    fetchAdminData();
  }, [id]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await getAdminById(id);
      const admin = response.data;
      
      setFormData({
        nama_lengkap: admin.profile?.full_name || '',
        email: admin.email || '',
        password: '',
        nickname: admin.profile?.nickname || '',
        nomor_telepon: admin.profile?.phone_number || '',
        alamat: admin.profile?.address || '',
        tanggal_lahir: admin.profile?.birth_date || '',
        jenis_kelamin: admin.profile?.gender || '',
        job: admin.profile?.job || '',
        hobby: admin.profile?.hobby || '',
        status: admin.profile?.status || 'Aktif',
        status_note: admin.profile?.status_note || '',
        foto_profil: null
      });
      
      if (admin.profile?.profile_picture) {
        setPreviewImage(`${import.meta.env.VITE_API_BASE_URL}/storage/${admin.profile.profile_picture}`);
      }
    } catch (error) {
      console.error('Error fetching admin:', error);
      toast.error('Gagal memuat data admin');
      navigate('/superadmin/kelola-admin');
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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        foto_profil: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      foto_profil: null
    }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_lengkap || !formData.email || !formData.jenis_kelamin || !formData.status) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (formData.status === 'Non-Aktif' && !formData.status_note) {
      toast.error('Catatan status non-aktif wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      submitData.append('full_name', formData.nama_lengkap);
      submitData.append('email', formData.email);
      submitData.append('gender', formData.jenis_kelamin);
      submitData.append('status', formData.status);
      submitData.append('_method', 'PUT');
      
      if (formData.password) submitData.append('password', formData.password);
      if (formData.nickname) submitData.append('nickname', formData.nickname);
      if (formData.nomor_telepon) submitData.append('phone_number', formData.nomor_telepon);
      if (formData.alamat) submitData.append('address', formData.alamat);
      if (formData.tanggal_lahir) submitData.append('birth_date', formData.tanggal_lahir);
      if (formData.job) submitData.append('job', formData.job);
      if (formData.hobby) submitData.append('hobby', formData.hobby);
      if (formData.status_note) submitData.append('status_note', formData.status_note);
      if (formData.foto_profil) submitData.append('profile_picture', formData.foto_profil);

      console.log('Submitting data:', Object.fromEntries(submitData));
      await updateAdmin(id, submitData);
      toast.success('Admin berhasil diperbarui');
      navigate('/superadmin/kelola-admin');
    } catch (error) {
      console.error('Error updating admin:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || 'Gagal memperbarui admin';
      toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-[#4DABFF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/superadmin/kelola-admin')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-white hover:bg-gray-50 text-gray-600'
                } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Edit Admin</h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Perbarui informasi admin</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl shadow-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Foto Profil</h3>
                
                <div className="flex items-start space-x-4">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      onChange={handleImageChange}
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
                        onClick={removeImage}
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                          isDark ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                        }`}
                      >
                        <X size={14} className="text-white" />
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
              </div>

              <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
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
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleInputChange}
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                          isDark 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
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
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleInputChange}
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
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
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
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
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
                      name="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={handleInputChange}
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
                      name="job"
                      value={formData.job}
                      onChange={handleInputChange}
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
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleInputChange}
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
                      name="hobby"
                      value={formData.hobby}
                      onChange={handleInputChange}
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
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent resize-none ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  {formData.status === 'Non-Aktif' && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Catatan Status Non-Aktif
                      </label>
                      <textarea
                        name="status_note"
                        value={formData.status_note}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent resize-none ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Masukkan alasan atau catatan mengapa admin ini non-aktif"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/superadmin/kelola-admin')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  Batal
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="px-6 py-3 bg-[#4DABFF] hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditAdmin;