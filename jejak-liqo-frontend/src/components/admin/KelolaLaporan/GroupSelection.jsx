import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Search, Filter, Users, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingState from '../../common/LoadingState';

const GroupSelection = ({ selectedGroups, onSelectionChange }) => {
  const { isDark } = useTheme();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  useEffect(() => {
    fetchGroups();
  }, [search, genderFilter]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genderFilter !== 'all') params.append('gender_filter', genderFilter);

      const response = await fetch(`http://localhost:8000/api/monthly-reports/groups?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.data || []);
      } else {
        toast.error('Gagal memuat daftar kelompok');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat daftar kelompok');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId) => {
    const newSelection = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allGroupIds = groups.map(group => group.id);
    onSelectionChange(allGroupIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getGenderBadgeColor = (gender) => {
    switch (gender) {
      case 'Ikhwan':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Akhwat':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center space-x-2 mb-6">
        <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Pilih Kelompok
        </h3>
        <span className={`text-sm px-2 py-1 rounded-full ${
          isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
        }`}>
          {selectedGroups.length} dipilih
        </span>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Cari kelompok atau mentor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">Semua</option>
            <option value="ikhwan">Ikhwan</option>
            <option value="akhwat">Akhwat</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className={`text-sm flex items-center space-x-1 ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            } transition-colors`}
          >
            <CheckSquare size={16} />
            <span>Pilih Semua</span>
          </button>
          <button
            onClick={handleClearAll}
            className={`text-sm flex items-center space-x-1 ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
            } transition-colors`}
          >
            <Square size={16} />
            <span>Kosongkan</span>
          </button>
        </div>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {groups.length} kelompok tersedia
        </span>
      </div>

      {/* Groups List */}
      <div className={`border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {loading ? (
          <div className="p-8 text-center">
            <LoadingState type="spinner" size="md" text="Memuat kelompok..." />
          </div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center">
            <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'} opacity-50`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Tidak ada kelompok ditemukan
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {groups.map((group, index) => (
              <div
                key={group.id}
                className={`flex items-center justify-between p-4 ${
                  index !== groups.length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''
                } hover:${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} transition-colors cursor-pointer`}
                onClick={() => handleGroupToggle(group.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedGroups.includes(group.id)
                      ? 'bg-blue-600 border-blue-600'
                      : `border-gray-300 ${isDark ? 'border-gray-600' : ''}`
                  }`}>
                    {selectedGroups.includes(group.id) && (
                      <CheckSquare size={14} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {group.group_name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Mentor: {group.mentor_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getGenderBadgeColor(group.group_gender)}`}>
                    {group.group_gender}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {group.mentee_count} mentee
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GroupSelection;