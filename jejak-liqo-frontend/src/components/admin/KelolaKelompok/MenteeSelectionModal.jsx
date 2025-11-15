import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { X, Users, Search, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { addMenteesToGroup, removeMenteesFromGroup, getGroupMentees } from '../../../api/groups';

const MenteeSelectionModal = ({ isOpen, onClose, group, onUpdate }) => {
  const { isDark } = useTheme();
  const [availableMentees, setAvailableMentees] = useState([]);
  const [currentMentees, setCurrentMentees] = useState([]);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'remove'

  useEffect(() => {
    if (isOpen && group) {
      fetchMentees();
    }
  }, [isOpen, group]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      
      // Fetch available mentees (same gender as mentor, no group)
      const availableResponse = await api.get(`/groups/available-mentees?mentor_id=${group.mentor_id}`);
      setAvailableMentees(availableResponse.data.data || []);
      
      // Fetch current mentees in this group
      const currentResponse = await getGroupMentees(group.id);
      setCurrentMentees(currentResponse.data.data || []);
      
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error('Gagal memuat data mentees');
    } finally {
      setLoading(false);
    }
  };

  const handleMenteeToggle = (menteeId) => {
    setSelectedMentees(prev => 
      prev.includes(menteeId)
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  const handleAddMentees = async () => {
    if (selectedMentees.length === 0) {
      toast.error('Pilih minimal 1 mentee untuk ditambahkan');
      return;
    }

    try {
      setLoading(true);
      await addMenteesToGroup(group.id, selectedMentees);
      toast.success(`${selectedMentees.length} mentee berhasil ditambahkan ke kelompok`);
      setSelectedMentees([]);
      fetchMentees();
      onUpdate();
    } catch (error) {
      toast.error('Gagal menambahkan mentees ke kelompok');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMentees = async () => {
    if (selectedMentees.length === 0) {
      toast.error('Pilih minimal 1 mentee untuk dikeluarkan');
      return;
    }

    try {
      setLoading(true);
      await removeMenteesFromGroup(group.id, selectedMentees);
      toast.success(`${selectedMentees.length} mentee berhasil dikeluarkan dari kelompok`);
      setSelectedMentees([]);
      fetchMentees();
      onUpdate();
    } catch (error) {
      toast.error('Gagal mengeluarkan mentees dari kelompok');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableMentees = availableMentees.filter(mentee =>
    mentee.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCurrentMentees = currentMentees.filter(mentee =>
    mentee.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-4xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Kelola Mentees - {group?.group_name}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Mentor: {group?.mentor?.name || 'Belum ada mentor'}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => {setActiveTab('add'); setSelectedMentees([]);}}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'add'
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserPlus size={16} className="inline mr-2" />
              Tambah Mentees ({filteredAvailableMentees.length})
            </button>
            <button
              onClick={() => {setActiveTab('remove'); setSelectedMentees([]);}}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'remove'
                  ? 'bg-red-500 text-white'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserMinus size={16} className="inline mr-2" />
              Keluarkan Mentees ({filteredCurrentMentees.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            <input
              type="text"
              placeholder="Cari nama mentee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Add Mentees Tab */}
              {activeTab === 'add' && (
                <div>
                  {!group?.mentor_id ? (
                    <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                      <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Kelompok ini belum memiliki mentor. Pilih mentor terlebih dahulu untuk menambahkan mentees.
                      </p>
                    </div>
                  ) : filteredAvailableMentees.length === 0 ? (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Tidak ada mentees yang tersedia untuk ditambahkan</p>
                      <p className="text-sm mt-2">
                        {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Semua mentees dengan gender yang sesuai sudah memiliki kelompok'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Mentees Tersedia ({filteredAvailableMentees.length})
                        </h4>
                        <span className={`text-sm px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                          {selectedMentees.length} dipilih
                        </span>
                      </div>
                      {filteredAvailableMentees.map((mentee) => (
                        <div
                          key={mentee.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedMentees.includes(mentee.id)
                              ? (isDark ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-500')
                              : (isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50')
                          }`}
                          onClick={() => handleMenteeToggle(mentee.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMentees.includes(mentee.id)}
                            onChange={() => handleMenteeToggle(mentee.id)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {mentee.full_name}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {mentee.gender} • {mentee.activity_class || 'Kelas tidak diketahui'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Remove Mentees Tab */}
              {activeTab === 'remove' && (
                <div>
                  {filteredCurrentMentees.length === 0 ? (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Tidak ada mentees di kelompok ini</p>
                      <p className="text-sm mt-2">
                        {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Tambahkan mentees terlebih dahulu'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Mentees di Kelompok ({filteredCurrentMentees.length})
                        </h4>
                        <span className={`text-sm px-2 py-1 rounded-full ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'}`}>
                          {selectedMentees.length} dipilih
                        </span>
                      </div>
                      {filteredCurrentMentees.map((mentee) => (
                        <div
                          key={mentee.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedMentees.includes(mentee.id)
                              ? (isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-500')
                              : (isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50')
                          }`}
                          onClick={() => handleMenteeToggle(mentee.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMentees.includes(mentee.id)}
                            onChange={() => handleMenteeToggle(mentee.id)}
                            className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {mentee.full_name}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {mentee.gender} • {mentee.activity_class || 'Kelas tidak diketahui'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Tutup
            </button>
            
            {activeTab === 'add' && group?.mentor_id && (
              <button
                onClick={handleAddMentees}
                disabled={loading || selectedMentees.length === 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menambahkan...' : `Tambahkan ${selectedMentees.length} Mentees`}
              </button>
            )}
            
            {activeTab === 'remove' && (
              <button
                onClick={handleRemoveMentees}
                disabled={loading || selectedMentees.length === 0}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengeluarkan...' : `Keluarkan ${selectedMentees.length} Mentees`}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MenteeSelectionModal;