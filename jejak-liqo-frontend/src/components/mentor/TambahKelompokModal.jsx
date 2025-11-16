import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { createMentorGroup } from '../../api/mentor';

const TambahKelompokModal = ({ isOpen, onClose, isDark, onSuccess }) => {
  const [formData, setFormData] = useState({
    group_name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createMentorGroup(formData);
      
      if (response.status === 'success') {
        toast.success('Kelompok berhasil dibuat');
        setFormData({ group_name: '', description: '' });
        onClose();
        if (onSuccess) onSuccess(response.data);
      } else {
        throw new Error(response.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat kelompok';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full max-w-md mx-4 p-6 rounded-xl shadow-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tambah Kelompok Baru
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nama Kelompok
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 h-5 w-5 text-emerald-500" />
              <input
                type="text"
                value={formData.group_name}
                onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                placeholder="Kelompok Tahfidz 1"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              placeholder="Deskripsi kelompok..."
              rows="3"
              required
            />
          </div>



          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahKelompokModal;