import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, announcement, loading = false }) => {
  const { isDark } = useTheme();

  if (!isOpen || !announcement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-md ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>Konfirmasi Penghapusan</h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Apakah Anda yakin ingin menghapus pengumuman ini? Pengumuman akan dipindahkan ke trash dan dapat dipulihkan nanti.
            </p>
            
            {/* Announcement Preview */}
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-2 line-clamp-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {announcement.title}
              </h4>
              <p className={`text-sm line-clamp-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {announcement.content?.substring(0, 100)}...
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;