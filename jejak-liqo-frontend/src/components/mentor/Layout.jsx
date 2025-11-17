import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { createMentorGroup } from '../../api/mentor';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, activeMenu, onCreateGroup }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ group_name: '', description: '' });
  const [creating, setCreating] = useState(false);


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
      
      // Navigate with refresh state
      navigate('/mentor/dashboard', { replace: true, state: { refresh: true } });
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
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        toggleSidebar={() => setIsSidebarOpen(true)}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
        onCreateGroup={onCreateGroup || (() => setShowCreateModal(true))}
        activeMenu={activeMenu}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeMenu={activeMenu}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      } pt-16`}>
        <main className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          {children}
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


    </div>
  );
};

export default Layout;