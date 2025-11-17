import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { getGroups } from '../../../api/groups';
import EditMenteeGroupChangeModal from '../../../components/admin/KelolaMentee/EditMenteeGroupChangeModal';
import LoadingState from '../../../components/common/LoadingState';

const EditMentee = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [originalGroupId, setOriginalGroupId] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    nickname: '',
    birth_date: '',
    phone_number: '',
    activity_class: '',
    hobby: '',
    address: '',
    status: 'Aktif',
    group_id: null
  });

  const [errors, setErrors] = useState({});
  const [showGroupChangeModal, setShowGroupChangeModal] = useState(false);

  useEffect(() => {
    fetchMentee();
    fetchGroups();
  }, [id]);

  const fetchMentee = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/mentees/${id}`);
      const mentee = response.data.data;
      const groupId = mentee.group_id || null;
      setFormData({
        full_name: mentee.full_name || '',
        gender: mentee.gender || '',
        nickname: mentee.nickname || '',
        birth_date: mentee.birth_date || '',
        phone_number: mentee.phone_number || '',
        activity_class: mentee.activity_class || '',
        hobby: mentee.hobby || '',
        address: mentee.address || '',
        status: mentee.status || 'Aktif',
        group_id: groupId
      });
      setOriginalGroupId(groupId);
    } catch (error) {
      console.error('Error fetching mentee:', error);
      toast.error('Gagal memuat data mentee');
      navigate('/admin/kelola-mentee');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      const groupsData = response.data.data || [];
      
      // Gender sudah tersedia dari GroupResource, fallback ke mentor gender jika perlu
      const groupsWithGender = groupsData.map(group => {
        let gender = group.gender || group.mentor?.gender;
        return {
          ...group,
          gender: gender
        };
      });
      
      setGroups(groupsWithGender);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Filter groups based on mentee gender
  const getFilteredGroups = () => {
    if (!formData.gender) return groups;
    return groups.filter(group => group.gender === formData.gender);
  };

  const validateMentee = (mentee) => {
    const errors = {};
    
    if (!mentee.full_name || mentee.full_name.trim() === '') {
      errors.full_name = 'Nama lengkap wajib diisi';
    }
    
    if (mentee.full_name && mentee.full_name.length > 255) {
      errors.full_name = 'Nama lengkap maksimal 255 karakter';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateMentee(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check if group is changing
    if (formData.group_id !== originalGroupId) {
      setShowGroupChangeModal(true);
      return;
    }

    await submitUpdate();
  };

  const submitUpdate = async () => {
    try {
      setLoading(true);
      await api.put(`/mentees/${id}`, formData);
      
      if (formData.group_id !== originalGroupId) {
        toast.success('Mentee berhasil diperbarui dan perpindahan kelompok tercatat');
      } else {
        toast.success('Mentee berhasil diperbarui');
      }
      
      navigate('/admin/kelola-mentee');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Gagal memperbarui mentee');
      }
    } finally {
      setLoading(false);
      setShowGroupChangeModal(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout activeMenu="Kelola Mentee">
        <div className="p-6">
          <LoadingState type="form" rows={8} text="Memuat data mentee..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="Kelola Mentee">
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
              onClick={() => navigate('/admin/kelola-mentee')}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              } transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Edit Mentee
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Mentee → Edit Mentee
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Group Info */}
        {originalGroupId && (
          <motion.div 
            className={`mb-6 p-4 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <strong>Kelompok Saat Ini:</strong> {groups.find(g => g.id == originalGroupId)?.group_name || 'Loading...'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div 
          className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Masukkan nama lengkap mentee"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Jenis Kelamin
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => {
                        const newGender = e.target.value;
                        setFormData({ 
                          ...formData, 
                          gender: newGender,
                          group_id: newGender !== formData.gender ? null : formData.group_id
                        });
                      }}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Kelas Aktivitas
                    </label>
                    <input
                      type="text"
                      value={formData.activity_class}
                      onChange={(e) => setFormData({ ...formData, activity_class: e.target.value })}
                      placeholder="Contoh: Kelas A, Tahfidz 1, dll"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hobi
                    </label>
                    <input
                      type="text"
                      value={formData.hobby}
                      onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
                      placeholder="Hobi mentee"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Alamat
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap mentee"
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Kelompok
                    </label>
                    <select
                      value={formData.group_id || ''}
                      onChange={(e) => setFormData({ ...formData, group_id: e.target.value || null })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Tidak ada kelompok</option>
                      {getFilteredGroups().map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.group_name} - {group.mentor?.name || 'Tanpa Mentor'}
                        </option>
                      ))}
                    </select>
                    {formData.gender && getFilteredGroups().length === 0 && (
                      <p className={`text-sm mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠️ Tidak ada kelompok {formData.gender} tersedia
                      </p>
                    )}
                    {formData.group_id !== originalGroupId && (
                      <p className={`text-sm mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠️ Perpindahan kelompok akan dicatat dalam history
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin/kelola-mentee')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Group Change Confirmation Modal */}
      <EditMenteeGroupChangeModal
        isOpen={showGroupChangeModal}
        onClose={() => setShowGroupChangeModal(false)}
        onConfirm={submitUpdate}
        loading={loading}
        originalGroupId={originalGroupId}
        newGroupId={formData.group_id}
        groups={groups}
      />
    </Layout>
  );
};

export default EditMentee;