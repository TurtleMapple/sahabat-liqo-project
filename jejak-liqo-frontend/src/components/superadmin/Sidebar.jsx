import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Megaphone,
  Activity,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, isCollapsed, toggleSidebar, activeMenu = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const menuSections = [
    {
      title: 'Menu Utama',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', active: activeMenu === 'Dashboard', path: '/superadmin/dashboard' }
      ]
    },
    {
      title: 'Manajemen',
      items: [
        { icon: Users, label: 'Kelola Admin', active: activeMenu === 'Kelola Admin', path: '/superadmin/kelola-admin' },
        { icon: UserCog, label: 'Kelola Super Admin', active: activeMenu === 'Kelola Super Admin', path: '/superadmin/kelola-superadmin' }
      ]
    },
    {
      title: 'Lainnya',
      items: [
        { icon: Megaphone, label: 'Pengumuman', active: activeMenu === 'Pengumuman', path: '/superadmin/pengumuman' },
        { icon: Activity, label: 'Aktivitas', active: activeMenu === 'Aktivitas', path: '/superadmin/aktivitas' }
      ]
    }
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
                        <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Super Admin</h2>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dashboard</p>
                      </div>
                    )}
                    {isCollapsed && window.innerWidth >= 1024 && (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SA</span>
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
              <nav className="flex-1 p-4">
                {menuSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-6">
                    {(!isCollapsed || window.innerWidth < 1024) && (
                      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (item.path !== '#') {
                              navigate(item.path);
                              // Auto close mobile sidebar after navigation
                              if (window.innerWidth < 1024) {
                                toggleSidebar();
                              }
                            }
                          }}
                          className={`w-full flex items-center ${isCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all ${
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
                    </div>
                  </div>
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