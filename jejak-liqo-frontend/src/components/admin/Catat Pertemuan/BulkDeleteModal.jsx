import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const BulkDeleteModal = ({ isOpen, onClose, onConfirm, selectedCount, isDeleting }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Hapus Catatan Pertemuan
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Konfirmasi penghapusan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-3">
              <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className={`font-medium mb-1 ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                  Peringatan Penghapusan
                </h3>
                <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                  Anda akan menghapus <strong>{selectedCount} catatan pertemuan</strong>. 
                  Data yang dihapus akan dipindahkan ke folder sampah dan dapat dipulihkan kembali.
                </p>
              </div>
            </div>
          </div>

          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            <p>Catatan pertemuan yang dihapus meliputi:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Data pertemuan dan kehadiran</li>
              <li>Dokumentasi foto pertemuan</li>
              <li>Catatan dan materi pertemuan</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Menghapus...' : `Hapus ${selectedCount} Pertemuan`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BulkDeleteModal;