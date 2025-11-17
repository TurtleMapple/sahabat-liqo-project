import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import api from '../../../api/axiosInstance';
import groupsAPI, { deleteGroup } from '../../../api/groups';
import { 
  Plus, 
  Search, 
  Filter,
  X,
  Trash2,
  Upload
} from 'lucide-react';
import { UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import MenteeSelectionModal from '../../../components/admin/KelolaKelompok/MenteeSelectionModal';
import GroupDetailModal from '../../../components/admin/KelolaKelompok/GroupDetailModal';
import GroupEditModal from '../../../components/admin/KelolaKelompok/GroupEditModal';
import GroupDeleteModal from '../../../components/admin/KelolaKelompok/GroupDeleteModal';
import GroupsTable from '../../../components/admin/KelolaKelompok/GroupsTable';
import CardTotalKelompok from '../../../components/admin/KelolaKelompok/CardTotalKelompok';
import GroupImportModal from '../../../components/admin/KelolaKelompok/GroupImportModal';
import { importGroups } from '../../../api/groupImport';

const KelolaKelompok = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  // States
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ group_type: '' });
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMenteeModal, setShowMenteeModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    mentor_id: ''
  });
  const [stats, setStats] = useState({
    total_groups: 0,
    ikhwan_groups: 0,
    akhwat_groups: 0
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [groupDetail, setGroupDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  // Effects
  useEffect(() => {
    fetchGroups(currentPage);
    fetchMentors();
    fetchStats();
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.create-dropdown')) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups(currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  // API Functions
  const fetchGroups = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        per_page: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.group_type && { group_type: filters.group_type })
      };
      const response = await groupsAPI.getGroups(params);
      setGroups(response.data.data || []);
      setPagination(response.data.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat data kelompok');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await api.get('/mentors');
      setMentors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await groupsAPI.getGroupsStatistics();
      setStats(response.data.data || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchGroupDetail = async (groupId) => {
    try {
      setDetailLoading(true);
      const response = await groupsAPI.getGroup(groupId);
      setGroupDetail(response.data.data);
    } catch (error) {
      console.error('Error fetching group detail:', error);
      toast.error('Gagal memuat detail kelompok');
    } finally {
      setDetailLoading(false);
    }
  };

  // Form Functions
  const validateForm = () => {
    const newErrors = {};
    if (!formData.group_name.trim()) {
      newErrors.group_name = 'Nama kelompok wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      group_name: '',
      description: '',
      mentor_id: ''
    });
    setErrors({});
  };

  // Handler Functions
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await groupsAPI.createGroup({
        group_name: formData.group_name,
        description: formData.description,
        mentor_id: formData.mentor_id || null
      });
      toast.success('Kelompok berhasil ditambahkan');
      setShowAddModal(false);
      resetForm();
      fetchGroups(currentPage);
      fetchStats();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Gagal menambahkan kelompok');
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await groupsAPI.updateGroup(selectedGroup.id, {
        group_name: formData.group_name,
        description: formData.description,
        mentor_id: formData.mentor_id || null
      });
      toast.success('Kelompok berhasil diperbarui');
      setShowEditModal(false);
      setSelectedGroup(null);
      resetForm();
      fetchGroups(currentPage);
      fetchStats();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Gagal memperbarui kelompok');
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteGroup(selectedGroup.id);
      toast.success(response.data.message || 'Kelompok berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedGroup(null);
      fetchGroups(currentPage);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus kelompok');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      group_name: group.group_name || '',
      description: group.description || '',
      mentor_id: group.mentor?.id || ''
    });
    setShowEditModal(true);
  };

  const openDetailModal = (group) => {
    setSelectedGroup(group);
    setShowDetailModal(true);
    fetchGroupDetail(group.id);
  };



  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      setShowImportModal(true);
    }
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;

    try {
      setImportLoading(true);
      const result = await importGroups(importFile);
      
      if (result.status === 'success') {
        const failureCount = result.failures_count || 0;
        
        if (failureCount > 0) {
          // Tampilkan setiap error dalam toast terpisah
          result.failures.forEach(failure => {
            failure.errors.forEach(error => {
              toast.error(`Baris ${failure.row}: ${error}`, {
                duration: 6000
              });
            });
          });
          
          toast.success(`${result.message} (${failureCount} baris gagal)`);
        } else {
          toast.success(result.message);
        }
      } else {
        toast.error(result.message);
      }
      
      setShowImportModal(false);
      setImportFile(null);
      fetchGroups(currentPage);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal import data');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportCancel = () => {
    setShowImportModal(false);
    setImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    setSelectedGroups(prev => 
      prev.length === groups.length ? [] : groups.map(g => g.id)
    );
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedGroups.map(id => deleteGroup(id)));
      toast.success(`${selectedGroups.length} kelompok berhasil dihapus`);
      setShowBulkDeleteModal(false);
      setSelectedGroups([]);
      fetchGroups(currentPage);
      fetchStats();
    } catch (error) {
      toast.error('Gagal menghapus beberapa kelompok');
    }
  };

  // Utility Functions
  const getGenderBadge = (genderDistribution) => {
    const ikhwanCount = genderDistribution?.ikhwan || 0;
    const akhwatCount = genderDistribution?.akhwat || 0;
    
    if (ikhwanCount > 0 && akhwatCount === 0) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
          Ikhwan
        </span>
      );
    } else if (akhwatCount > 0 && ikhwanCount === 0) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-pink-900/20 text-pink-400' : 'bg-pink-100 text-pink-800'}`}>
          Akhwat
        </span>
      );
    } else if (ikhwanCount > 0 && akhwatCount > 0) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-800'}`}>
          Campuran
        </span>
      );
    } else {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
          Kosong
        </span>
      );
    }
  };

  return (
    <Layout activeMenu="Kelola Kelompok">
      <div className="p-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kelola Kelompok
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola data kelompok mentoring dalam sistem
            </p>
          </div>
          
          {selectedGroups.length > 0 && (
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Hapus ({selectedGroups.length})</span>
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin/kelola-kelompok/trashed')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Trash2 size={20} />
              <span>Kelompok Terhapus</span>
            </button>
            
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <Upload size={20} />
                <span>Import Kelompok</span>
              </button>
            </div>
            
            <div className="relative create-dropdown">
              <button
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Plus size={20} />
                <span>Buat Kelompok</span>
                <svg className={`w-4 h-4 ml-2 transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            
              {showCreateDropdown && (
                <div className={`absolute right-0 mt-3 w-80 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm ${
                  isDark ? 'bg-gray-800/95 border border-gray-600' : 'bg-white/95 border border-gray-200'
                }`}>
                  <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Pilih Jenis Kelompok
                    </h3>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => {
                        navigate('/admin/kelola-kelompok/tambah?gender=Ikhwan');
                        setShowCreateDropdown(false);
                      }}
                      className={`w-full p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isDark 
                          ? 'hover:bg-blue-500/10 border-2 border-gray-700 hover:border-blue-500/50' 
                          : 'hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${
                            isDark ? 'bg-blue-600' : 'bg-blue-500'
                          }`}>
                            <UserIcon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`font-bold text-lg ${isDark ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-700'}`}>
                            Kelompok Ikhwan
                          </div>
                        </div>
                        <div className={`transition-all group-hover:translate-x-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        isDark ? 'bg-gradient-to-r from-blue-600/5 to-blue-400/5' : 'bg-gradient-to-r from-blue-500/5 to-blue-300/5'
                      }`}></div>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/kelola-kelompok/tambah?gender=Akhwat');
                        setShowCreateDropdown(false);
                      }}
                      className={`w-full p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isDark 
                          ? 'hover:bg-pink-500/10 border-2 border-gray-700 hover:border-pink-500/50' 
                          : 'hover:bg-pink-50 border-2 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${
                            isDark ? 'bg-pink-600' : 'bg-pink-500'
                          }`}>
                            <UserIcon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`font-bold text-lg ${isDark ? 'text-white group-hover:text-pink-300' : 'text-gray-900 group-hover:text-pink-700'}`}>
                            Kelompok Akhwat
                          </div>
                        </div>
                        <div className={`transition-all group-hover:translate-x-1 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        isDark ? 'bg-gradient-to-r from-pink-600/5 to-pink-400/5' : 'bg-gradient-to-r from-pink-500/5 to-pink-300/5'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className={`px-5 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Buat Kelompok Mentoring Baru
                      </p>
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <CardTotalKelompok stats={stats} />

        {/* Filter & Search */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className={isDark ? 'text-white' : 'text-gray-800'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filter & Pencarian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Cari nama kelompok atau mentor..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <select
              value={filters.group_type}
              onChange={(e) => handleFilterChange('group_type', e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Semua Kelompok</option>
              <option value="ikhwan">Kelompok Ikhwan</option>
              <option value="akhwat">Kelompok Akhwat</option>
            </select>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GroupsTable
            groups={groups}
            loading={loading}
            pagination={pagination}
            getGenderBadge={getGenderBadge}
            openDetailModal={openDetailModal}
            setSelectedGroup={setSelectedGroup}
            setShowMenteeModal={setShowMenteeModal}
            setShowDeleteModal={setShowDeleteModal}
            handlePageChange={handlePageChange}
            selectedGroups={selectedGroups}
            onSelectGroup={handleSelectGroup}
            onSelectAll={handleSelectAll}
          />
        </motion.div>

        {/* Modals */}
        <GroupEditModal
          isOpen={showEditModal}
          onClose={() => {setShowEditModal(false); setSelectedGroup(null); resetForm();}}
          selectedGroup={selectedGroup}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          mentors={mentors}
          onSubmit={handleEdit}
        />

        <GroupDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {setShowDeleteModal(false); setSelectedGroup(null);}}
          selectedGroup={selectedGroup}
          onDelete={handleDelete}
        />

        <GroupDetailModal
          isOpen={showDetailModal}
          onClose={() => {setShowDetailModal(false); setSelectedGroup(null); setGroupDetail(null);}}
          selectedGroup={selectedGroup}
          groupDetail={groupDetail}
          detailLoading={detailLoading}
          getGenderBadge={getGenderBadge}
        />

        <MenteeSelectionModal
          isOpen={showMenteeModal}
          onClose={() => {setShowMenteeModal(false); setSelectedGroup(null);}}
          group={selectedGroup}
          onUpdate={() => {fetchGroups(); fetchStats();}}
        />

        <GroupImportModal
          isOpen={showImportModal}
          onClose={handleImportCancel}
          onConfirm={handleImportConfirm}
          fileName={importFile?.name}
          loading={importLoading}
        />

        {/* Bulk Delete Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <Trash2 className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Hapus Kelompok
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Hapus {selectedGroups.length} kelompok yang dipilih
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    Kelompok yang dihapus akan dipindahkan ke folder terhapus dan dapat dipulihkan kembali.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex-1 px-4 py-2 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KelolaKelompok;