import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import Layout from '../../../components/admin/Layout';
import { User, Mail, Phone, MapPin, Briefcase, Heart, Calendar, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateProfile, changePassword } from '../../../api/profile';
import { getProfileImageUrl, getInitials } from '../../../utils/imageUtils';


const Profile = () => {
  const { isDark } = useTheme();
  const { user, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    email: '',
    phone_number: '',
    address: '',
    job: '',
    hobby: '',
    birth_date: '',
    gender: '',
    profile_picture: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);


  const [errors, setErrors] = useState({});

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user?.profile?.full_name || user?.name || '',
        nickname: user?.profile?.nickname || '',
        email: user?.email || '',
        phone_number: user?.profile?.phone_number || '',
        address: user?.profile?.address || '',
        job: user?.profile?.job || '',
        hobby: user?.profile?.hobby || '',
        birth_date: user?.profile?.birth_date || '',
        gender: user?.profile?.gender || '',
        profile_picture: user?.profile?.profile_picture || ''
      });
      setProfilePicturePreview(
        getProfileImageUrl(user?.profile?.profile_picture)
      );
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = { ...formData };
      if (profilePictureFile) {
        submitData.profile_picture = profilePictureFile;
      }

      console.log('Submitting profile data:', submitData);
      const response = await updateProfile(submitData);
      console.log('Profile update response:', response);
      
      await fetchUserProfile();
      toast.success('Profile berhasil diperbarui!');
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Terdapat kesalahan validasi');
      } else {
        toast.error('Gagal memperbarui profile!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setErrors({});

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setErrors({ new_password_confirmation: ['Konfirmasi password tidak cocok'] });
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword(passwordData);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      toast.success('Password berhasil diubah!');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Gagal mengubah password!');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout activeMenu="Profile">
      <div className="p-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Profile Saya
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Kelola informasi profile dan keamanan akun Anda
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6">
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Informasi Profile
              </h2>

              <form onSubmit={handleProfileSubmit}>
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Foto Profile
                  </label>
                  
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200 ${
                        profilePicturePreview ? 'hidden' : 'flex'
                      }`}>
                        {getInitials(formData.full_name, user?.email)}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setProfilePictureFile(file);
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setProfilePicturePreview(e.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Klik ikon kamera untuk mengubah foto profile
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Format: JPG, PNG, GIF (Max: 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <User size={16} className="inline mr-1" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'border-red-500' : ''}`}
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name[0]}</p>
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
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Mail size={16} className="inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Phone size={16} className="inline mr-1" />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Calendar size={16} className="inline mr-1" />
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

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Briefcase size={16} className="inline mr-1" />
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      value={formData.job}
                      onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

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
                      <option value="Ikhwan">Ikhwan</option>
                      <option value="Akhwat">Akhwat</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Heart size={16} className="inline mr-1" />
                    Hobi
                  </label>
                  <input
                    type="text"
                    value={formData.hobby}
                    onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MapPin size={16} className="inline mr-1" />
                    Alamat
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Simpan Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-6">
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Ubah Password
              </h2>

              <form onSubmit={handlePasswordSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${errors.current_password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.current_password && (
                      <p className="text-red-500 text-sm mt-1">{errors.current_password[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${errors.new_password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.new_password && (
                      <p className="text-red-500 text-sm mt-1">{errors.new_password[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                        className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${errors.new_password_confirmation ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.new_password_confirmation && (
                      <p className="text-red-500 text-sm mt-1">{errors.new_password_confirmation[0]}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengubah...
                      </>
                    ) : (
                      'Ubah Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>


      </div>
    </Layout>
  );
};

export default Profile;