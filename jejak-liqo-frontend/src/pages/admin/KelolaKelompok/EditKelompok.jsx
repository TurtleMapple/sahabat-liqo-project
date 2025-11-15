import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft } from 'lucide-react';
import { getGroupById, updateGroup, getMentorsForEdit, getMenteesForEdit } from '../../../api/groups';
import LoadingState from '../../../components/common/LoadingState';

const EditKelompok = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [selectedGender, setSelectedGender] = useState('');
  const [mentorSearch, setMentorSearch] = useState('');
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    mentor_id: '',
    mentee_ids: []
  });
  
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [conflictMentees, setConflictMentees] = useState([]);

  useEffect(() => {
    loadGroupData();
  }, [id]);

  useEffect(() => {
    if (group) {
      loadMentors();
      loadMentees();
    }
  }, [group]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowMentorDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadGroupData = async () => {
    try {
      const response = await getGroupById(id);
      const groupData = response.data.data;
      
      setGroup(groupData);
      setFormData({
        group_name: groupData.group_name,
        description: groupData.description || '',
        mentor_id: groupData.mentor_id,
        mentee_ids: groupData.mentees.map(m => m.id)
      });
      
      // Set mentor name in search input
      if (groupData.mentor?.profile?.full_name || groupData.mentor?.name) {
        setMentorSearch(groupData.mentor.profile?.full_name || groupData.mentor.name);
      }
      
      if (groupData.mentor?.profile?.gender) {
        setSelectedGender(groupData.mentor.profile.gender);
      }
    } catch (error) {
      toast.error('Gagal memuat data kelompok');
      navigate('/admin/kelola-kelompok');
    } finally {
      setLoading(false);
    }
  };

  const loadMentors = async () => {
    try {
      const response = await getMentorsForEdit(id);
      setMentors(response.data.data);
    } catch (error) {
      console.error('Error loading mentors:', error);
    }
  };

  const loadMentees = async () => {
    try {
      const response = await getMenteesForEdit(id);
      setMentees(response.data.data);
    } catch (error) {
      console.error('Error loading mentees:', error);
    }
  };

  const handleMentorSelect = (mentor) => {
    setFormData(prev => ({ ...prev, mentor_id: mentor.id }));
    setMentorSearch(mentor.name);
    setShowMentorDropdown(false);
  };
  
  const handleMentorSearchChange = (value) => {
    setMentorSearch(value);
    setShowMentorDropdown(true);
    
    // If input is cleared, clear mentor selection
    if (!value.trim()) {
      setFormData(prev => ({ ...prev, mentor_id: '' }));
    }
  };
  
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(mentorSearch.toLowerCase())
  );

  const handleMenteeToggle = (menteeId) => {
    const mentee = mentees.find(m => m.id === menteeId);
    
    if (formData.mentee_ids.includes(menteeId)) {
      // Remove mentee
      setFormData(prev => ({
        ...prev,
        mentee_ids: prev.mentee_ids.filter(id => id !== menteeId)
      }));
    } else {
      // Add mentee - check for conflicts
      if (mentee.group_id && mentee.group_id !== parseInt(id)) {
        setConflictMentees([mentee]);
        setShowConfirmModal(true);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        mentee_ids: [...prev.mentee_ids, menteeId]
      }));
    }
  };

  const handleConfirmConflict = () => {
    const menteeId = conflictMentees[0].id;
    setFormData(prev => ({
      ...prev,
      mentee_ids: [...prev.mentee_ids, menteeId]
    }));
    setShowConfirmModal(false);
    setConflictMentees([]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.group_name.trim()) {
      newErrors.group_name = 'Nama kelompok wajib diisi';
    }
    
    if (!formData.mentor_id) {
      newErrors.mentor_id = 'Mentor wajib dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await updateGroup(id, formData);
      toast.success('Kelompok berhasil diperbarui');
      navigate('/admin/kelola-kelompok');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui kelompok');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout activeMenu="Kelola Kelompok">
        <div className="p-6 min-h-96">
          <LoadingState type="dots" size="md" text="Memuat data kelompok..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="Kelola Kelompok">
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
              onClick={() => navigate('/admin/kelola-kelompok')}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              } transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Edit Kelompok
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Kelompok → Edit Kelompok
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
                {/* Basic Info */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
                    Informasi Kelompok
                  </h3>
            
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nama Kelompok <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.group_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, group_name: e.target.value }))}
                        placeholder="Masukkan nama kelompok"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${
                          errors.group_name ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.group_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.group_name}</p>
                      )}
                    </div>
                    <div className="relative">
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Mentor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={mentorSearch}
                        onChange={(e) => handleMentorSearchChange(e.target.value)}
                        onFocus={() => setShowMentorDropdown(true)}
                        placeholder="Ketik nama mentor atau pilih dari daftar"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${
                          errors.mentor_id ? 'border-red-500' : ''
                        }`}
                      />
                      
                      {/* Dropdown List */}
                      {showMentorDropdown && filteredMentors.length > 0 && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-48 overflow-y-auto ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}>
                          {filteredMentors.map(mentor => (
                            <div
                              key={mentor.id}
                              onClick={() => handleMentorSelect(mentor)}
                              className={`px-3 py-2 cursor-pointer hover:bg-opacity-80 ${
                                isDark ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-900'
                              } ${formData.mentor_id === mentor.id ? (isDark ? 'bg-blue-900' : 'bg-blue-50') : ''}`}
                            >
                              <div className="font-medium">{mentor.name}</div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {mentor.gender}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {errors.mentor_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.mentor_id}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deskripsi Kelompok
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Deskripsi kelompok (opsional)"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                {/* Mentees Management */}
                {mentees.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
                      Kelola Mentees ({selectedGender}) - {formData.mentee_ids.length} dipilih
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Pilih mentees untuk kelompok ini
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tersedia</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Sudah di kelompok</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Dipilih</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`h-64 overflow-y-auto rounded-lg border p-2 ${
                      isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      {mentees.map((mentee) => (
                        <div
                          key={mentee.id}
                          className={`flex items-center p-3 mb-2 rounded-lg border transition-all cursor-pointer ${
                            formData.mentee_ids.includes(mentee.id)
                              ? (isDark ? 'bg-blue-900/40 border-blue-500' : 'bg-blue-50 border-blue-300')
                              : mentee.group_id
                                ? (isDark ? 'border-orange-500/50 bg-orange-900/20 hover:bg-orange-900/30' : 'border-orange-300 bg-orange-50 hover:bg-orange-100')
                                : (isDark ? 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50' : 'border-gray-300 bg-white hover:bg-gray-50')
                          }`}
                          onClick={() => handleMenteeToggle(mentee.id)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.mentee_ids.includes(mentee.id)}
                            onChange={() => handleMenteeToggle(mentee.id)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {mentee.full_name}
                              </div>
                              {mentee.group_id && mentee.group_id !== parseInt(id) ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                                  Sudah di kelompok
                                </span>
                              ) : mentee.group_id === parseInt(id) ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                                  Anggota saat ini
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                                  Tersedia
                                </span>
                              )}
                            </div>
                            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {mentee.gender} • {mentee.activity_class || 'Kelas tidak diketahui'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="grid grid-cols-2 gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-kelompok')}
                    className={`w-full px-6 py-2 rounded-lg border ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Update Kelompok'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Conflict Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Konfirmasi Perpindahan
              </h3>
              
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Mentee <strong>{conflictMentees[0]?.full_name}</strong> sudah tergabung dalam kelompok lain. 
                Apakah Anda yakin ingin memindahkannya ke kelompok ini?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmConflict}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Ya, Pindahkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditKelompok;