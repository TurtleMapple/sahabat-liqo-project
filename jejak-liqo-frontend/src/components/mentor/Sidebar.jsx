import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileImageUrl, getInitials } from '../../utils/imageUtils';
import { 
  X, 
  Home, 
  Calendar,
  Bell,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, isCollapsed, toggleSidebar, activeMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const menuItems = [
    { icon: Home, label: 'Beranda', path: '/mentor/dashboard' },
    { icon: Calendar, label: 'Pertemuan', path: '/mentor/catatan-pertemuan' },
    { icon: Bell, label: 'Pengumuman', path: '/mentor/pengumuman' }
  ];

  const getActiveMenu = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => currentPath.startsWith(item.path));
    return activeItem ? activeItem.label : 'Dashboard';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-30 lg:z-auto transition-all duration-300 ease-in-out ${
          isDark ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'
        } ${
          isCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? 'w-20 shadow-lg' 
            : 'w-64 sm:w-72 shadow-xl'
        } ${
          isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) 
            ? 'translate-x-0' 
            : '-translate-x-full'
        }`}
      >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 pt-16 lg:pt-4">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center ${
                    isCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 
                      ? 'justify-center' 
                      : 'space-x-3'
                  }`}>
                    {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                      <div>
                        <h2 className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Menu
                        </h2>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Mentor Dashboard
                        </p>
                      </div>
                    )}
                    {isCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {getInitials(user?.profile?.full_name || user?.name, user?.email)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={toggleSidebar} 
                    className={`lg:hidden p-1 rounded-lg transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-3 sm:px-4 space-y-1 sm:space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = activeMenu === item.label || location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={`menu-${index}`}
                      onClick={() => {
                        navigate(item.path);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                      className={`w-full flex items-center transition-all duration-200 ${
                        isCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 
                          ? 'justify-center px-2 py-3' 
                          : 'space-x-3 px-3 sm:px-4 py-2.5 sm:py-3'
                      } rounded-lg ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-md'
                          : isDark 
                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title={isCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 ? item.label : ''}
                    >
                      <item.icon size={18} className="flex-shrink-0" />
                      {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                        <>
                          <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
                          {isActive && <ChevronRight className="ml-auto flex-shrink-0" size={16} />}
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
        </aside>
    </>
  );
};

export default Sidebar;