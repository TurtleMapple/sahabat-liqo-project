import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, LogOut, User, ChevronDown, Plus, PanelLeftClose, PanelLeft, Settings } from 'lucide-react';
import { logout } from '../../api/auth';
import toast from 'react-hot-toast';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';
import logoLight from '../../assets/images/logo/LogoShaf_Terang.png';
import logoDark from '../../assets/images/logo/LogoShaf_Gelap.png';

const Header = ({ toggleSidebar, toggleCollapse, isCollapsed, onCreateGroup, activeMenu }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.setItem('showLogoutSuccessToast', 'true');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout, coba lagi.');
    }
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 h-16 backdrop-blur-sm ${
        isDark ? 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700' : 'bg-white/95 border-gray-200'
      } border-b shadow-sm`}>
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          {/* Left: Logo & Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className={`lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <Menu size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <button
              onClick={toggleCollapse}
              className={`hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? 
                <PanelLeft size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} /> :
                <PanelLeftClose size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
              }
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src={isDark ? logoLight : logoDark} 
                alt="Sahabat Liqo" 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className={`text-base sm:text-lg font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  {activeMenu || 'Dashboard'}
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'}`}>
                  Sahabat Liqo
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className={`text-sm font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  {activeMenu || 'Dashboard'}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Add Group & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                title="Tambah"
              >
                <Plus size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              {showAddMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${
                  isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-lg py-1 z-50`}>
                  <button
                    onClick={() => {
                      onCreateGroup && onCreateGroup();
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Buat Kelompok Baru
                  </button>
                </div>
              )}
            </div>
            

            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white sm:w-4 sm:h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} truncate max-w-32`}>
                    {user?.profile?.full_name || user?.name || 'Mentor'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'} truncate max-w-32`}>
                    {user?.email}
                  </p>
                </div>
                <ChevronDown size={14} className={`${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'} transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                } hidden sm:block`} />
              </button>
              
              {/* Profile Menu */}
              {showProfileMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${
                  isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-lg py-1 z-50`}>
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                      {user?.profile?.full_name || user?.name || 'Mentor'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'}`}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/mentor/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close menus */}
      {(showProfileMenu || showAddMenu) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowAddMenu(false);
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Header;