import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import meetingsAPI from '../../../api/meetings';
import { 
  XMarkIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const MeetingModal = ({ 
  isOpen, 
  onClose, 
  meeting = null, 
  groups = [], 
  onSuccess 
}) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    group_id: '',
    meeting_date: '',
    place: '',
    topic: '',
    notes: '',
    meeting_type: 'Offline'
  });

  const isEdit = !!meeting;

  useEffect(() => {
    if (meeting) {
      setFormData({
        group_id: meeting.group?.id || '',
        meeting_date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : '',
        place: meeting.place || '',
        topic: meeting.topic || '',
        notes: meeting.notes || '',
        meeting_type: meeting.meeting_type || 'Offline'
      });
    } else {
      setFormData({
        group_id: '',
        meeting_date: '',
        place: '',
        topic: '',
        notes: '',
        meeting_type: 'Offline'
      });
    }
  }, [meeting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.group_id || !formData.meeting_date || !formData.meeting_type) {
      toast.error('Mohon lengkapi field yang wajib diisi');
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit) {
        await meetingsAPI.updateMeeting(meeting.id, formData);
        toast.success('Catatan pertemuan berhasil diperbarui');
      } else {
        await meetingsAPI.createMeeting(formData);
        toast.success('Catatan pertemuan berhasil dibuat');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan catatan pertemuan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEdit ? 'Edit Catatan Pertemuan' : 'Tambah Catatan Pertemuan'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isEdit ? 'Perbarui informasi pertemuan' : 'Buat catatan pertemuan baru'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Selection */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <UserGroupIcon className="w-4 h-4 inline mr-2" />
                Kelompok <span className="text-red-500">*</span>
              </label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              >
                <option value="">Pilih Kelompok</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} - {group.mentor}
                  </option>
                ))}
              </select>
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
                onChange={handleChange}
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
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              >
                <option value="Online">💻 Online</option>
                <option value="Offline">🏢 Offline</option>
                <option value="Assignment">📝 Assignment</option>
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
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="Masukkan tempat pertemuan"
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
                onChange={handleChange}
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

          {/* Actions */}
          <div className="flex space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MeetingModal;