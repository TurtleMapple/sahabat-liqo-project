import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

const EditMenteeGroupChangeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  originalGroupId, 
  newGroupId, 
  groups 
}) => {
  const { isDark } = useTheme();

  const originalGroup = originalGroupId ? groups.find(g => g.id == originalGroupId) : null;
  const newGroup = newGroupId ? groups.find(g => g.id == newGroupId) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Konfirmasi Perpindahan Kelompok
          </h3>
          <div className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <p className="mb-2">Mentee akan dipindahkan:</p>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Dari:</strong> {originalGroup?.group_name || 'Tidak ada kelompok'}
              </div>
              <div>
                <strong>Ke:</strong> {newGroup?.group_name || 'Tidak ada kelompok'}
              </div>
            </div>
            <p className="mt-3 text-sm text-yellow-600">Perpindahan ini akan dicatat dalam history.</p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditMenteeGroupChangeModal;