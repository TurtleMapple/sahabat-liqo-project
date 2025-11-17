import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout } from '../../api/auth';
import { useTheme } from '../../contexts/ThemeContext';
import { getProfile } from '../../api/profile';
import { 
  Menu, 
  Moon,
  Sun,
  UserCog, 
  FileText,
  LogOut
} from 'lucide-react';
import logoTerang from '../../assets/images/logo/LogoShaf_Terang.png';
import logoGelap from '../../assets/images/logo/LogoShaf_Gelap.png';


const Header = ({ toggleSidebar, onLogoutClick }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await getProfile();
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    const handleProfileUpdate = (event) => {
      setUserData(event.detail);
    };
    
    loadUserData();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);



  return (
    <header className={`backdrop-blur-lg sticky top-0 z-30 transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900/80 border-b border-gray-700' 
        : 'bg-white/80 border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={toggleSidebar}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Menu size={24} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
        </button>

        <div className="flex-1 lg:flex-none flex items-center gap-3 ml-4 lg:ml-0">
          <button
            onClick={toggleSidebar}
            className={`hidden lg:block p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Menu size={24} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>

          <img
            src={isDark ? logoTerang : logoGelap}
            alt="Logo Shaf Pembangunan"
            className="w-10 h-10 object-contain"
          />

          <h1 className={`text-xl font-bold tracking-wide ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Sahabat Liqo
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg"
            >
              {userData?.profile?.profile_picture ? (
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL}/storage/${userData.profile.profile_picture}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userData?.profile?.full_name ? userData.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SA'}
                  </span>
                </div>
              )}
              
              <div className={`hidden md:block ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <p className="font-semibold text-sm leading-tight">
                  {userData?.profile?.full_name || 'Super Admin'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userData?.email || 'Loading...'}
                </p>
              </div>
              
              <svg 
                className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setProfileOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50 ${
                      isDark 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="p-4 bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white">
                      <p className="font-semibold">{userData?.profile?.full_name || 'Super Admin'}</p>
                      <p className="text-sm text-blue-100">{userData?.email || 'Loading...'}</p>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/superadmin/settings');
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${
                          isDark 
                            ? 'hover:bg-gray-700 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <UserCog size={18} />
                        <span>Pengaturan</span>
                      </button>

                      <div className={`my-2 ${
                        isDark ? 'border-t border-gray-600' : 'border-t border-gray-200'
                      }`}></div>
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          onLogoutClick();
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${
                          isDark 
                            ? 'hover:bg-red-900/20 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <LogOut size={18} />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      

    </header>
  );
};

export default Header;