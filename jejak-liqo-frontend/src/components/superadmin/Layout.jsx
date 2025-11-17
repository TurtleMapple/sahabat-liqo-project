import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout } from '../../api/auth';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';

const Layout = ({ children, activeMenu = 'Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { isDark } = useTheme();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Initialize and handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(false);
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout berhasil.');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout, coba lagi.');
    }
    setShowLogoutModal(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-[#4DABFF]/10 via-white to-[#4DABFF]/5'
    }`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        activeMenu={activeMenu}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : 'lg:ml-72'
      }`}>
        <Header toggleSidebar={toggleSidebar} onLogoutClick={() => setShowLogoutModal(true)} />
        
        <main>
          {children}
        </main>
      </div>
      
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Layout;