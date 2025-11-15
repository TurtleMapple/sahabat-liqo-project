import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

const GroupDeleteModal = ({ 
  isOpen, 
  onClose, 
  selectedGroup, 
  onDelete 
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !selectedGroup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Hapus Kelompok
          </h3>
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
              ℹ️ Menghapus kelompok "{selectedGroup.group_name}" akan:
            </p>
            <ul className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'} list-disc list-inside space-y-1`}>
              <li>Kelompok dipindah ke "Kelompok Terhapus"</li>
              <li>{selectedGroup.mentees_count || 0} mentees akan menjadi "tanpa kelompok"</li>
              <li>Mentor tidak terpengaruh</li>
              <li>Kelompok bisa dipulihkan nanti</li>
            </ul>
            <p className={`text-xs mt-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Ini adalah penghapusan sementara, bukan permanen.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              Batal
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Hapus Sementara
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupDeleteModal;