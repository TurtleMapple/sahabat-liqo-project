import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import meetingsAPI from '../../../api/meetings';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const TambahPertemuan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedGroupMentees, setSelectedGroupMentees] = useState([]);
  const [formData, setFormData] = useState({
    group_id: '',
    meeting_date: '',
    place: '',
    topic: '',
    notes: '',
    meeting_type: 'Offline'
  });
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Filter groups based on search
    const filtered = groups.filter(group => 
      group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.mentor.toLowerCase().includes(groupSearch.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [groups, groupSearch]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.group-select-container')) {
        setShowGroupDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.group_id) {
      fetchGroupMentees(formData.group_id);
    } else {
      setSelectedGroupMentees([]);
      setAttendances([]);
    }
  }, [formData.group_id]);

  const fetchGroups = async () => {
    try {
      const response = await meetingsAPI.getGroups();
      const groupsData = response.data.data || [];
      setGroups(groupsData);
      setFilteredGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat data kelompok');
    }
  };

  const handleGroupSelect = (group) => {
    setFormData(prev => ({ ...prev, group_id: group.id }));
    setGroupSearch(`${group.name} - ${group.mentor}`);
    setShowGroupDropdown(false);
  };

  const handleGroupSearchChange = (e) => {
    const value = e.target.value;
    setGroupSearch(value);
    setShowGroupDropdown(true);
    
    // Clear selection if search is cleared
    if (!value) {
      setFormData(prev => ({ ...prev, group_id: '' }));
    }
  };

  const fetchGroupMentees = async (groupId) => {
    try {
      const response = await meetingsAPI.getGroupMentees(groupId);
      const mentees = response.data.data?.mentees || [];
      
      setSelectedGroupMentees(mentees);
      
      // Initialize attendance with default 'Hadir' status
      const initialAttendances = mentees.map(mentee => ({
        mentee_id: mentee.id,
        mentee_name: mentee.full_name,
        status: 'Hadir',
        notes: ''
      }));
      setAttendances(initialAttendances);
    } catch (error) {
      console.error('Error fetching group mentees:', error);
      toast.error('Gagal memuat data mentee kelompok');
      setSelectedGroupMentees([]);
      setAttendances([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceChange = (menteeId, field, value) => {
    setAttendances(prev => prev.map(attendance => 
      attendance.mentee_id === menteeId 
        ? { ...attendance, [field]: value }
        : attendance
    ));
  };

  const bulkSetAttendance = (status) => {
    setAttendances(prev => prev.map(attendance => ({
      ...attendance,
      status: status
    })));
  };

  const getAttendanceStats = () => {
    const hadir = attendances.filter(a => a.status === 'Hadir').length;
    const sakit = attendances.filter(a => a.status === 'Sakit').length;
    const izin = attendances.filter(a => a.status === 'Izin').length;
    const alpa = attendances.filter(a => a.status === 'Alpa').length;
    
    return { hadir, sakit, izin, alpa, total: attendances.length };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hadir':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Sakit':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'Izin':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'Alpa':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Hadir': isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200',
      'Sakit': isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Izin': isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200',
      'Alpa': isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200',
    };
    
    return colors[status] || colors['Hadir'];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.group_id || !formData.meeting_date || !formData.meeting_type) {
      toast.error('Mohon lengkapi field yang wajib diisi');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare meeting data with attendances
      const meetingData = {
        ...formData,
        attendances: attendances.map(attendance => ({
          mentee_id: attendance.mentee_id,
          status: attendance.status,
          notes: attendance.notes || null
        }))
      };
      
      // Create meeting with attendances
      await meetingsAPI.createMeeting(meetingData);
      
      toast.success('Pertemuan berhasil dibuat');
      navigate('/admin/catatan-pertemuan');
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat pertemuan');
    } finally {
      setLoading(false);
    }
  };

  const stats = getAttendanceStats();

  return (
    <Layout activeMenu="Catatan Pertemuan">
      <div className="p-3 sm:p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center space-x-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button
            onClick={() => navigate('/admin/catatan-pertemuan')}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <ArrowLeftIcon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Tambah Pertemuan
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Buat catatan pertemuan baru dengan daftar kehadiran
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Info Card */}
          <motion.div 
            className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Informasi Pertemuan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group Selection */}
              <div className="md:col-span-2 relative group-select-container">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <UserGroupIcon className="w-4 h-4 inline mr-2" />
                  Kelompok <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={groupSearch}
                      onChange={handleGroupSearchChange}
                      onFocus={() => setShowGroupDropdown(true)}
                      placeholder="Cari kelompok..."
                      required={!formData.group_id}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    />
                  </div>
                  
                  {/* Dropdown */}
                  {showGroupDropdown && filteredGroups.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 rounded-xl border shadow-lg max-h-60 overflow-y-auto ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}>
                      {filteredGroups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleGroupSelect(group)}
                          className={`w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors ${
                            isDark 
                              ? 'hover:bg-gray-600 text-white' 
                              : 'hover:bg-gray-100 text-gray-900'
                          } ${formData.group_id === group.id ? (isDark ? 'bg-blue-600' : 'bg-blue-100') : ''}`}
                        >
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Mentor: {group.mentor}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* No results */}
                  {showGroupDropdown && filteredGroups.length === 0 && groupSearch && (
                    <div className={`absolute z-10 w-full mt-1 rounded-xl border shadow-lg p-4 text-center ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-600'
                    }`}>
                      Tidak ada kelompok yang ditemukan
                    </div>
                  )}
                </div>
              </div>

              {/* Meeting Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                  Tanggal Pertemuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="meeting_date"
                  value={formData.meeting_date}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipe Pertemuan <span className="text-red-500">*</span>
                </label>
                <select
                  name="meeting_type"
                  value={formData.meeting_type}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Topik Pertemuan
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Masukkan topik pertemuan"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                />
              </div>

              {/* Place */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPinIcon className="w-4 h-4 inline mr-2" />
                  Tempat
                </label>
                <input
                  type="text"
                  name="place"
                  value={formData.place}
                  onChange={handleInputChange}
                  placeholder={
                    formData.meeting_type === 'Online' 
                      ? "Link meeting/Zoom" 
                      : formData.meeting_type === 'Offline'
                      ? "Alamat/Ruangan"
                      : "Tempat pertemuan"
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                  Catatan Pertemuan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tulis catatan pertemuan, materi yang dibahas, hasil diskusi, dll..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                />
              </div>
            </div>
          </motion.div>

          {/* Attendance Card */}
          {formData.group_id && attendances.length > 0 && (
            <motion.div 
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Daftar Kehadiran Mentee
                </h2>
                
                {/* Bulk Actions */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => bulkSetAttendance('Hadir')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    Semua Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkSetAttendance('Alpa')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Hadir</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{stats.hadir}</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Sakit</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{stats.sakit}</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Izin</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{stats.izin}</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>Alpa</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>{stats.alpa}</p>
                </div>
              </div>

              {/* Attendance List */}
              <div className="space-y-3">
                {attendances.map((attendance) => (
                  <motion.div
                    key={attendance.mentee_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Name and Icon */}
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(attendance.status)}
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attendance.mentee_name}
                        </p>
                      </div>
                      
                      {/* Right: Status and Notes */}
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadge(attendance.status)}`}>
                          {attendance.status}
                        </span>
                        
                        <select
                          value={attendance.status}
                          onChange={(e) => handleAttendanceChange(attendance.mentee_id, 'status', e.target.value)}
                          className={`px-3 py-2 rounded-lg border text-sm ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Izin">Izin</option>
                          <option value="Alpa">Alpa</option>
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Catatan..."
                          value={attendance.notes}
                          onChange={(e) => handleAttendanceChange(attendance.mentee_id, 'notes', e.target.value)}
                          className={`px-3 py-2 rounded-lg border text-sm w-32 ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => navigate('/admin/catatan-pertemuan')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
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
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Pertemuan'}
            </button>
          </motion.div>
        </form>
      </div>
    </Layout>
  );
};

export default TambahPertemuan;