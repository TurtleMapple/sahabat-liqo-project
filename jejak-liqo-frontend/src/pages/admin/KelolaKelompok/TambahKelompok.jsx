import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Users, UserCheck, AlertCircle, Lightbulb, Search } from 'lucide-react';
import { DocumentTextIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { getAvailableMentors, getAvailableMentees, getMentorGender, createGroup, getAllMenteesForGroupForm } from '../../../api/groups';

const TambahKelompok = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedMentorGender, setSelectedMentorGender] = useState(null);
  const [mentorSearch, setMentorSearch] = useState('');
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [menteesWithGroups, setMenteesWithGroups] = useState([]);
  const [menteeSearch, setMenteeSearch] = useState('');
  const [menteeFilter, setMenteeFilter] = useState('all'); // 'all', 'available', 'occupied'
  
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    mentor_id: '',
    mentee_ids: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Read gender from URL parameter
    const urlParams = new URLSearchParams(location.search);
    const genderParam = urlParams.get('gender');
    if (genderParam && ['Ikhwan', 'Akhwat'].includes(genderParam)) {
      setSelectedGender(genderParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedGender) {
      fetchAvailableMentors();
      fetchAllMentees();
    }
  }, [selectedGender]);

  useEffect(() => {
    if (formData.mentor_id) {
      setSelectedMentorGender(selectedGender);
    } else {
      setSelectedMentorGender(null);
      setMentorSearch('');
    }
  }, [formData.mentor_id, selectedGender]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.mentor-dropdown')) {
        setShowMentorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAvailableMentors = async () => {
    try {
      setMentorLoading(true);
      const response = await getAvailableMentors();
      
      const mentorData = response.data.data || response.data || [];
      
      // Filter mentors by selected gender
      const filteredMentors = mentorData.filter(mentor => mentor.gender === selectedGender);
      
      if (filteredMentors.length === 0) {
        // Try fallback
        const fallbackResponse = await api.get('/mentors');
        const fallbackData = fallbackResponse.data.data || fallbackResponse.data || [];
        const transformedData = fallbackData
          .filter(mentor => mentor.profile?.gender === selectedGender)
          .map(mentor => ({
            id: mentor.id,
            name: mentor.profile?.full_name || mentor.email || `Mentor #${mentor.id}`,
            gender: mentor.profile?.gender || mentor.gender
          }));
        setMentors(transformedData);
      } else {
        setMentors(filteredMentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Gagal memuat data mentor');
    } finally {
      setMentorLoading(false);
    }
  };

  const fetchAllMentees = async () => {
    try {
      const response = await getAllMenteesForGroupForm(selectedGender);
      const allMentees = response.data.data || response.data || [];
      setMentees(allMentees);
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error('Gagal memuat data mentee');
      setMentees([]);
    }
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

  const handleMenteeToggle = (menteeId) => {
    setFormData(prev => ({
      ...prev,
      mentee_ids: prev.mentee_ids.includes(menteeId)
        ? prev.mentee_ids.filter(id => id !== menteeId)
        : [...prev.mentee_ids, menteeId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check if any selected mentees already have groups
    const selectedMentees = mentees.filter(mentee => formData.mentee_ids.includes(mentee.id));
    const menteesWithExistingGroups = selectedMentees.filter(mentee => mentee.group_id);
    
    if (menteesWithExistingGroups.length > 0) {
      setMenteesWithGroups(menteesWithExistingGroups);
      setShowConfirmModal(true);
      return;
    }

    // If no conflicts, create group directly
    await createGroupDirectly();
  };

  const createGroupDirectly = async () => {
    try {
      setLoading(true);
      
      // Prepare data for backend
      const groupData = {
        group_name: formData.group_name,
        description: formData.description || null,
        mentor_id: formData.mentor_id,
        mentee_ids: formData.mentee_ids.length > 0 ? formData.mentee_ids : null,
        gender: selectedGender
      };
      
      await createGroup(groupData);
      toast.success('Kelompok berhasil dibuat');
      navigate('/admin/kelola-kelompok');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(message => {
          toast.error(message);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Gagal membuat kelompok');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = async () => {
    setShowConfirmModal(false);
    await createGroupDirectly();
  };

  const selectedMentor = mentors.find(m => m.id == formData.mentor_id);

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
                Tambah Kelompok Baru
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Kelompok → Tambah Kelompok
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
              <div className="space-y-8">
                {/* Section 1: Informasi Dasar */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Informasi Dasar Kelompok
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Kelompok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
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
                  <div className="relative mentor-dropdown">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mentor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={mentorSearch}
                        onChange={(e) => {
                          setMentorSearch(e.target.value);
                          setShowMentorDropdown(true);
                          if (!e.target.value) {
                            setFormData({ ...formData, mentor_id: '' });
                          }
                        }}
                        onFocus={() => setShowMentorDropdown(true)}
                        placeholder="Cari dan pilih mentor..."
                        className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 ${
                          errors.mentor_id ? 'border-red-500' : ''
                        }`}
                      />
                      {mentorSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setMentorSearch('');
                            setFormData({ ...formData, mentor_id: '' });
                            setShowMentorDropdown(false);
                          }}
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                            isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                        >
                          ×
                        </button>
                      )}
                      {showMentorDropdown && (
                        <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}>
                          {mentorLoading ? (
                            <div className={`px-3 py-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Loading mentors...
                            </div>
                          ) : mentors.length === 0 ? (
                            <div className={`px-3 py-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Tidak ada mentor tersedia
                            </div>
                          ) : mentors
                            .filter(mentor => 
                              (mentor.name || mentor.profile?.full_name || '').toLowerCase().includes(mentorSearch.toLowerCase())
                            )
                            .map((mentor) => (
                              <div
                                key={mentor.id}
                                onClick={() => {
                                  setFormData({ ...formData, mentor_id: mentor.id });
                                  setMentorSearch(`${mentor.name || mentor.profile?.full_name} (${mentor.gender})`);
                                  setShowMentorDropdown(false);
                                }}
                                className={`px-3 py-2 cursor-pointer transition-colors ${
                                  isDark 
                                    ? 'text-white hover:bg-gray-600' 
                                    : 'text-gray-900 hover:bg-gray-100'
                                } ${formData.mentor_id == mentor.id ? (isDark ? 'bg-blue-900/20' : 'bg-blue-100') : ''}`}
                              >
                                <div className="font-medium">{mentor.name || mentor.profile?.full_name}</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {mentor.gender}
                                </div>
                              </div>
                            ))
                          }
                          {mentors.filter(mentor => 
                            (mentor.name || mentor.profile?.full_name || '').toLowerCase().includes(mentorSearch.toLowerCase())
                          ).length === 0 && mentors.length > 0 && (
                            <div className={`px-3 py-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Tidak ada mentor ditemukan
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      placeholder="Jelaskan tujuan atau karakteristik kelompok ini (opsional)"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    />
                  </div>
                </div>

                {/* Section 2: Informasi Mentor */}
                {selectedMentor && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                      👨‍🏫 Mentor Terpilih
                    </h3>
                    <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <div className="flex items-center space-x-3">
                        <UserCheck className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            {selectedMentor.name || selectedMentor.profile?.full_name}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Mentor {selectedGender}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Section 3: Pilih Mentees */}
                {selectedGender && mentees.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} flex items-center`}>
                        <Users size={20} className="mr-2" />
                        Pilih Mentees ({selectedGender})
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          formData.mentee_ids.length > 0 
                            ? (isDark ? 'bg-green-900/20 text-green-400 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200')
                            : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                        }`}>
                          {formData.mentee_ids.length} mentee dipilih
                        </span>
                      </div>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          value={menteeSearch}
                          onChange={(e) => setMenteeSearch(e.target.value)}
                          placeholder="Cari mentee..."
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      <select
                        value={menteeFilter}
                        onChange={(e) => setMenteeFilter(e.target.value)}
                        className={`px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="all">Semua Status</option>
                        <option value="available">Tersedia</option>
                        <option value="occupied">Sudah di Kelompok</option>
                      </select>
                    </div>
                    
                    <div className={`rounded-lg border ${isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-300 bg-gray-50'}`}>
                      <div className={`p-3 border-b ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Klik pada mentee untuk memilih/membatalkan pilihan
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <span className="px-2 py-1 rounded-full bg-green-500 text-white font-medium">Tersedia</span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Belum punya kelompok</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="px-2 py-1 rounded-full bg-orange-500 text-white font-medium">Sudah di kelompok</span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Akan dipindah</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-80 overflow-y-auto">
                        {(() => {
                          const filteredMentees = mentees.filter(mentee => {
                            const matchesSearch = mentee.full_name.toLowerCase().includes(menteeSearch.toLowerCase()) ||
                                                (mentee.activity_class || '').toLowerCase().includes(menteeSearch.toLowerCase());
                            const matchesFilter = menteeFilter === 'all' || 
                                                (menteeFilter === 'available' && !mentee.group_id) ||
                                                (menteeFilter === 'occupied' && mentee.group_id);
                            return matchesSearch && matchesFilter;
                          });
                          
                          return filteredMentees.length > 0 ? filteredMentees.map((mentee, index) => (
                            <div
                              key={mentee.id}
                              className={`flex items-center p-4 border-b last:border-b-0 transition-all cursor-pointer ${
                                formData.mentee_ids.includes(mentee.id)
                                  ? (isDark ? 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/40' : 'bg-blue-50 border-blue-200 hover:bg-blue-100')
                                  : mentee.group_id
                                    ? (isDark ? 'border-orange-600 bg-orange-900/10 hover:bg-orange-900/20' : 'border-orange-200 bg-orange-50 hover:bg-orange-100')
                                    : (isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')
                              }`}
                              onClick={() => handleMenteeToggle(mentee.id)}
                            >
                              <input
                                type="checkbox"
                                checked={formData.mentee_ids.includes(mentee.id)}
                                onChange={() => handleMenteeToggle(mentee.id)}
                                className="mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                              />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {mentee.full_name}
                                  </div>
                                  {mentee.group_id ? (
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
                                    isDark ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'
                                  }`}>
                                    Sudah di kelompok
                                  </span>
                                ) : (
                                  <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
                                    isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                                  }`}>
                                    Tersedia
                                  </span>
                                )}
                                </div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {mentee.gender} • {mentee.activity_class || 'Kelas tidak diketahui'}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {mentee.group_id && (
                                  <div className={`w-3 h-3 rounded-full ${
                                    isDark ? 'bg-orange-500' : 'bg-orange-400'
                                  }`} title="Sudah memiliki kelompok"></div>
                                )}
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  formData.mentee_ids.includes(mentee.id)
                                    ? (isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-200 text-blue-800')
                                    : (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600')
                                }`}>
                                  #{index + 1}
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Users size={48} className="mx-auto mb-3 opacity-50" />
                              <p>Tidak ada mentee yang sesuai dengan pencarian</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {errors.mentee_ids && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.mentee_ids}
                      </p>
                    )}
                  </div>
                )}

                {/* No Mentees Available */}
                {selectedGender && mentees.length === 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} flex items-center`}>
                      <Users size={20} className="mr-2" />
                      Pilih Mentees ({selectedGender})
                    </h3>
                    <div className={`p-6 rounded-lg border-l-4 border-yellow-500 text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                      <AlertCircle className={`mx-auto mb-3 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} size={48} />
                      <div className={`text-lg font-medium mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Tidak Ada Mentee Tersedia
                      </div>
                      <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Saat ini tidak ada mentee {selectedGender} yang tersedia untuk ditambahkan ke kelompok.
                      </div>
                      <div className={`text-xs mt-3 flex items-center justify-center ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                        <Lightbulb size={14} className="mr-1" />
                        Anda masih bisa membuat kelompok dan menambahkan mentee nanti
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-kelompok')}
                    className={`flex-1 px-6 py-3 rounded-lg border font-medium transition-all ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.group_name.trim() || !formData.mentor_id}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      loading || !formData.group_name.trim() || !formData.mentor_id
                        ? 'bg-gray-400 text-gray-200'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Membuat Kelompok...
                      </span>
                    ) : (
                      'Buat Kelompok'
                    )}
                  </button>
                </div>
                
                {/* Form Summary */}
                <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Ringkasan:</strong> 
                    {formData.group_name ? (
                      <span className="ml-1">
                        Kelompok "{formData.group_name}" 
                        {selectedMentor && `dengan mentor ${selectedMentor.name || selectedMentor.profile?.full_name}`}
                        {formData.mentee_ids.length > 0 && ` dan ${formData.mentee_ids.length} mentee`}
                      </span>
                    ) : (
                      <span className="ml-1 text-gray-400">Lengkapi form untuk melihat ringkasan</span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Konfirmasi Pembuatan Kelompok
                </h3>
              </div>
              
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`${isDark ? 'text-orange-400' : 'text-orange-600'} mt-0.5`} size={20} />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-800'} mb-2`}>
                      Beberapa mentee yang dipilih sudah memiliki kelompok:
                    </p>
                    <ul className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-700'} space-y-1`}>
                      {menteesWithGroups.map(mentee => (
                        <li key={mentee.id} className="flex items-center">
                          <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                          {mentee.full_name}
                        </li>
                      ))}
                    </ul>
                    <p className={`text-xs mt-3 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
                      Jika Anda melanjutkan, mentee-mentee tersebut akan dipindahkan ke kelompok baru ini.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Membuat...' : 'Tetap Buat Kelompok'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TambahKelompok;