import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileImageUrl, getInitials } from '../../utils/imageUtils';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText,
  Calendar,
  UsersRound,
  Megaphone,
  Settings,
  ChevronRight,
  User,
  Upload
} from 'lucide-react';

const Sidebar = ({ isOpen, isCollapsed, toggleSidebar, activeMenu = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: activeMenu === 'Dashboard', path: '/admin/dashboard' },
    { icon: User, label: 'Kelola Mentee', active: activeMenu === 'Kelola Mentee', path: '/admin/kelola-mentee' },
    { icon: UserCheck, label: 'Kelola Mentor', active: activeMenu === 'Kelola Mentor', path: '/admin/kelola-mentor' },
    { icon: FileText, label: 'Kelola Laporan', active: activeMenu === 'Kelola Laporan', path: '/admin/kelola-laporan' },
    { icon: Calendar, label: 'Catatan Pertemuan', active: activeMenu === 'Catatan Pertemuan', path: '/admin/catatan-pertemuan' },
    { icon: UsersRound, label: 'Kelola Kelompok', active: activeMenu === 'Kelola Kelompok', path: '/admin/kelola-kelompok' },
    { icon: Megaphone, label: 'Kelola Pengumuman', active: activeMenu === 'Kelola Pengumuman', path: '/admin/kelola-pengumuman' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(!isCollapsed || isOpen) && (
          <motion.aside
            key="sidebar"
            initial={false}
            animate={{ 
              x: window.innerWidth >= 1024 ? 0 : (isOpen ? 0 : -300),
              opacity: 1
            }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed left-0 top-0 h-screen w-72 shadow-2xl z-50 lg:z-auto transition-colors duration-300 ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className={`px-6 py-6 transition-colors duration-300 ${
                isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-3 ${isCollapsed && window.innerWidth >= 1024 ? 'justify-center' : ''}`}>
                    {(!isCollapsed || window.innerWidth < 1024) && (
                      <div>
                        <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin</h2>
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
                {menuItems.map((item, index) => (
                  <motion.button
                    key={`menu-${index}`}
                    whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0 }}
                    onClick={() => {
                      if (item.path !== '#') {
                        navigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center ${isCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-none ${
                      item.active
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
                        {item.active && <ChevronRight className="ml-auto" size={18} />}
                      </>
                    )}
                  </motion.button>
                ))}
              </nav>


            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;