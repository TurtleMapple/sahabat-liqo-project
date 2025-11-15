import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { TrashIcon } from '@heroicons/react/24/outline';

const MeetingDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  meeting, 
  isDeleting = false 
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !meeting) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <TrashIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Hapus Catatan Pertemuan
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mb-2`}>
              <strong>Topik:</strong> {meeting.topic || 'Pertemuan Kelompok'}
            </p>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mb-2`}>
              <strong>Kelompok:</strong> {meeting.group?.name}
            </p>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              <strong>Tanggal:</strong> {formatDate(meeting.meeting_date)}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                isDeleting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MeetingDeleteModal;