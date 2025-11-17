import React, { useState } from 'react';
import Layout from '../../components/superadmin/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Calendar,
  Camera,
  Moon,
  Sun,
  Save,
  LogOut,
  Shield,
  Heart,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../api/profile';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    email: '',
    gender: 'Ikhwan',
    phone_number: '',
    hobby: '',
    address: '',
    job: '',
    birth_date: '',
    profile_picture: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email tidak boleh kosong';
    }
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap tidak boleh kosong';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Mohon lengkapi data yang diperlukan');
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('nickname', formData.nickname || '');
      formDataToSend.append('email', formData.email);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('phone_number', formData.phone_number || '');
      formDataToSend.append('hobby', formData.hobby || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('job', formData.job || '');
      formDataToSend.append('birth_date', formData.birth_date || '');
      
      if (formData.remove_profile_picture) {
        formDataToSend.append('remove_profile_picture', '1');
      } else if (formData.profile_picture && typeof formData.profile_picture !== 'string') {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }

      const response = await updateProfile(formDataToSend);
      toast.success('Pengaturan berhasil disimpan');
      
      // Trigger profile update event
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: response.data
      }));
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profile_picture: file,
          profile_picture_preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      profile_picture: null,
      profile_picture_preview: null,
      remove_profile_picture: true
    }));
  };

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getProfile();
        const userData = response.data;
        
        setFormData({
          full_name: userData.profile?.full_name || '',
          nickname: userData.profile?.nickname || '',
          email: userData.email || '',
          gender: userData.profile?.gender || 'Ikhwan',
          phone_number: userData.profile?.phone_number || '',
          hobby: userData.profile?.hobby || '',
          address: userData.profile?.address || '',
          job: userData.profile?.job || '',
          birth_date: userData.profile?.birth_date || '',
          profile_picture: userData.profile?.profile_picture || null
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Gagal memuat data profile');
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, []);

  if (pageLoading) {
    return (
      <Layout activeMenu="Settings">
        <div className="w-full max-w-full px-6 py-6">
          <div className="animate-pulse space-y-8">
            <div className="mb-8">
              <div className={`h-8 w-48 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-4 w-96 mt-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
            
            <div className={`rounded-xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center space-x-4 mb-8">
                <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className="space-y-2">
                  <div className={`h-6 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </div>
              </div>
              
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-12 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-12 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`rounded-xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-6 w-32 mb-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-16 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="Settings">
      <div className="w-full max-w-full px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Pengaturan
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Kelola profil dan preferensi akun Super Admin
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Card */}
          <div className={`rounded-2xl shadow-xl transition-all duration-300 overflow-hidden ${
            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}>
            <div className={`relative p-8 ${
              isDark ? 'bg-gradient-to-r from-gray-800/30 to-gray-700/20' : 'bg-gradient-to-r from-gray-50/30 to-white/50'
            }`}>
              <div className="flex items-start space-x-6 mb-8">
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-input"
                  />
                  <label htmlFor="profile-picture-input" className="cursor-pointer">
                    <div className={`relative w-24 h-24 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                      isDark ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20' : 'bg-gradient-to-br from-[#4DABFF] to-blue-600 shadow-lg shadow-blue-500/20'
                    }`}>
                      {(formData.profile_picture_preview || (formData.profile_picture && !formData.remove_profile_picture)) ? (
                        <img 
                          src={formData.profile_picture_preview || (formData.profile_picture ? `${import.meta.env.VITE_API_BASE_URL}/storage/${formData.profile_picture}` : '')} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">SA</span>
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                  </label>
                  {(formData.profile_picture_preview || (formData.profile_picture && !formData.remove_profile_picture)) && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                        isDark ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                      }`}
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  )}
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                    isDark ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-blue-500 shadow-lg shadow-blue-500/30'
                  }`}>
                    <Camera size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Super Admin
                    </h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDark ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      Online
                    </div>
                  </div>
                  <p className={`text-lg mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    System Administrator
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center px-3 py-2 rounded-lg ${
                      isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-100 border border-blue-200'
                    }`}>
                      <Shield size={16} className="text-blue-500 mr-2" />
                      <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Super Administrator</span>
                    </div>
                    <div className={`flex items-center px-3 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'
                    }`}>
                      <Mail size={16} className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>admin@jejakliqo.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <User size={16} className="inline mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <User size={16} className="inline mr-2" />
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <User size={16} className="inline mr-2" />
                      Jenis Kelamin
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="Ikhwan">Ikhwan</option>
                      <option value="Akhwat">Akhwat</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Calendar size={16} className="inline mr-2" />
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Mail size={16} className="inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Phone size={16} className="inline mr-2" />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>



                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Heart size={16} className="inline mr-2" />
                    Hobi
                  </label>
                  <input
                    type="text"
                    name="hobby"
                    value={formData.hobby}
                    onChange={handleInputChange}
                    placeholder="Contoh: Membaca, Olahraga, Musik"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <MapPin size={16} className="inline mr-2" />
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Briefcase size={16} className="inline mr-2" />
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Theme Settings Card */}
          <div className={`rounded-xl shadow-lg transition-colors duration-300 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-blue-600/20' : 'bg-blue-100'
                }`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-blue-500' : 'bg-blue-600'
                  }`}>
                    {isDark ? (
                      <Moon size={14} className="text-white" />
                    ) : (
                      <Sun size={14} className="text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Pengaturan Tampilan
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sesuaikan tema aplikasi dengan preferensi Anda
                  </p>
                </div>
              </div>
              
              <div className={`relative p-6 rounded-2xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800/50 border border-gray-600/50 shadow-inner' 
                  : 'bg-white/80 border border-gray-200/80 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isDark 
                        ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30' 
                        : 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-300/50'
                    }`}>
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                        isDark ? 'animate-pulse bg-yellow-400/10' : 'animate-pulse bg-indigo-500/10'
                      }`}></div>
                      {isDark ? (
                        <Sun size={28} className="text-yellow-500 relative z-10" />
                      ) : (
                        <Moon size={28} className="text-indigo-600 relative z-10" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {isDark ? 'Mode Gelap' : 'Mode Terang'}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isDark ? 'Tampilan gelap yang nyaman di mata' : 'Tampilan cerah dan bersih'}
                      </p>
                      <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        isDark 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          isDark ? 'bg-yellow-400' : 'bg-indigo-600'
                        }`}></div>
                        Aktif
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-12 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 ${
                        isDark 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 focus:ring-yellow-500/50 shadow-lg shadow-yellow-500/25' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 focus:ring-indigo-500/50 shadow-lg shadow-indigo-500/25'
                      }`}
                    >
                      <span className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isDark ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                      }`}></span>
                      <span
                        className={`relative inline-block h-8 w-8 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                          isDark ? 'translate-x-10' : 'translate-x-2'
                        }`}
                      >
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          isDark ? 'rotate-180' : 'rotate-0'
                        }`}>
                          {isDark ? (
                            <Moon size={16} className="text-gray-700" />
                          ) : (
                            <Sun size={16} className="text-gray-700" />
                          )}
                        </span>
                      </span>
                    </button>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Klik untuk ganti
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management Card */}
          <div className={`rounded-xl shadow-lg transition-colors duration-300 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-8">
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Manajemen Akun
              </h3>
              <div className="space-y-4">
                <div className={`p-6 rounded-lg border ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield size={20} className="text-blue-500" />
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Keamanan Akun
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Kelola keamanan dan privasi akun Super Admin
                        </p>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}>
                      Ubah Password
                    </button>
                  </div>
                </div>
                <div className={`p-6 rounded-lg border border-red-200 ${
                  isDark ? 'bg-red-900/10' : 'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <LogOut size={20} className="text-red-500" />
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Keluar Akun
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Keluar dari sesi Super Admin saat ini
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      Keluar Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;