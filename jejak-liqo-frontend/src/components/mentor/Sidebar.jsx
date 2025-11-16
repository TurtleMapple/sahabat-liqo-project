import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileImageUrl, getInitials } from '../../utils/imageUtils';
import { 
  X, 
  Home, 
  FileText,
  Bell,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/mentor/dashboard' },
    { icon: FileText, label: 'Catat Pertemuan', path: '/mentor/catatan-pertemuan' },
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      {(!isCollapsed || isOpen) && (
        <aside
          className={`fixed left-0 top-0 h-screen ${isCollapsed && window.innerWidth >= 1024 ? 'w-20' : 'w-72'} shadow-2xl z-50 lg:z-auto transition-all duration-200 ${
            isDark ? 'bg-gray-900' : 'bg-white'
          } ${isOpen || window.innerWidth >= 1024 ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-3 ${isCollapsed && window.innerWidth >= 1024 ? 'justify-center' : ''}`}>
                    {(!isCollapsed || window.innerWidth < 1024) && (
                      <div>
                        <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Mentor</h2>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dashboard</p>
                      </div>
                    )}
                    {isCollapsed && window.innerWidth >= 1024 && (
                      <div className="w-9 h-8 rounded-lg overflow-hidden">
                        {getProfileImageUrl(user?.profile?.profile_picture) ? (
                          <img 
                            src={getProfileImageUrl(user?.profile?.profile_picture)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-[#4DABFF] to-blue-600 flex items-center justify-center ${getProfileImageUrl(user?.profile?.profile_picture) ? 'hidden' : 'flex'}`}>
                          <span className="text-white font-bold text-sm">
                            {getInitials(user?.profile?.full_name || user?.name, user?.email)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={toggleSidebar} 
                    className={`lg:hidden transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={`menu-${index}`}
                      onClick={() => {
                        navigate(item.path);
                        if (window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                      className={`w-full flex items-center ${isCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-[#4DABFF] to-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : isDark 
                            ? 'text-gray-300 hover:bg-gray-800' 
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={isCollapsed && window.innerWidth >= 1024 ? item.label : ''}
                    >
                      <item.icon size={20} />
                      {(!isCollapsed || window.innerWidth < 1024) && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          {isActive && <ChevronRight className="ml-auto" size={18} />}
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;