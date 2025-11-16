import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { createMentorGroup } from '../../api/mentor';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ group_name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [showSuccessLoading, setShowSuccessLoading] = useState(false);

  // Check if user is mentor
  useEffect(() => {
    if (user && user.role !== 'mentor') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.group_name.trim()) {
      toast.error('Nama kelompok harus diisi');
      return;
    }

    try {
      setCreating(true);
      await createMentorGroup(formData);
      toast.success('Kelompok berhasil dibuat');
      setShowCreateModal(false);
      setFormData({ group_name: '', description: '' });
      setShowSuccessLoading(true);
      
      // Navigate with refresh state
      navigate('/mentor/dashboard', { replace: true, state: { refresh: true } });
      
      // Hide loading after navigation
      setTimeout(() => {
        setShowSuccessLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Gagal membuat kelompok');
    } finally {
      setCreating(false);
    }
  };

  if (!user || user.role !== 'mentor') {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        toggleSidebar={() => setIsSidebarOpen(true)}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
        onCreateGroup={() => setShowCreateModal(true)}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Main Content */}
      <div className={`${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'} pt-16 transition-all duration-200`}>
        <main className="p-6 pb-20 lg:pb-6 min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tambah Kelompok Baru
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ group_name: '', description: '' });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Kelompok *
                  </label>
                  <input
                    type="text"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan nama kelompok"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan deskripsi kelompok (opsional)"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ group_name: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  {creating ? 'Membuat...' : 'Buat Kelompok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Loading Overlay */}
      {showSuccessLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-900 dark:text-white font-medium">Memuat kelompok baru...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;