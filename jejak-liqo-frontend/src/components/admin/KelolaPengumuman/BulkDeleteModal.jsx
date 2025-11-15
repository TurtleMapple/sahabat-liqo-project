import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const BulkDeleteModal = ({ 
  isOpen, 
  onClose, 
  selectedCount, 
  onConfirm, 
  loading = false 
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md rounded-2xl shadow-2xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  isDark ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    isDark ? 'text-red-400' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Hapus Pengumuman
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className={`p-4 rounded-xl mb-6 ${
              isDark 
                ? 'bg-red-500/10 border border-red-500/20' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <Trash2 className={`w-5 h-5 mt-0.5 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    isDark ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Anda akan menghapus {selectedCount} pengumuman
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-red-400' : 'text-red-700'
                  }`}>
                    Semua pengumuman yang dipilih akan dihapus dan dipindahkan ke trash.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Batal
              </button>
              
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {loading ? 'Menghapus...' : `Hapus ${selectedCount} Item`}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkDeleteModal;