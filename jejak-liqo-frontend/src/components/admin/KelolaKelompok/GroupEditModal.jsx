import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { X } from 'lucide-react';

const GroupEditModal = ({ 
  isOpen, 
  onClose, 
  selectedGroup, 
  formData, 
  setFormData, 
  errors, 
  mentors, 
  onSubmit 
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
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Edit Kelompok
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Nama Kelompok <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.group_name}
                onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 ${
                  errors.group_name ? 'border-red-500' : ''
                }`}
                placeholder="Masukkan nama kelompok"
              />
              {errors.group_name && (
                <p className="text-red-500 text-sm mt-1">{errors.group_name}</p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                placeholder="Deskripsi kelompok (opsional)"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Mentor
              </label>
              <select
                value={formData.mentor_id}
                onChange={(e) => setFormData({...formData, mentor_id: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Pilih Mentor (Opsional)</option>
                {mentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name || mentor.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupEditModal;