import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ExclamationTriangleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const TokenExpirationModal = ({ 
  isOpen, 
  onClose, 
  onLoginRedirect, 
  type = 'expired', // 'expired' or 'warning'
  remainingTime = 0 
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const isExpired = type === 'expired';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-full ${
              isExpired 
                ? isDark ? 'bg-red-500/20' : 'bg-red-100'
                : isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
            }`}>
              {isExpired ? (
                <ExclamationTriangleIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              ) : (
                <ClockIcon className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isExpired ? 'Sesi Berakhir' : 'Peringatan Sesi'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isExpired 
                  ? 'Waktu login Anda telah habis'
                  : `Sesi akan berakhir dalam ${remainingTime} menit`
                }
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl mb-6 ${
            isExpired
              ? isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
              : isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm ${
              isExpired
                ? isDark ? 'text-red-300' : 'text-red-700'
                : isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              {isExpired ? (
                <>
                  <strong>Sesi login Anda telah berakhir setelah 3 jam.</strong>
                  <br />
                  Untuk keamanan, Anda perlu login ulang untuk melanjutkan.
                </>
              ) : (
                <>
                  <strong>Sesi Anda akan berakhir dalam {remainingTime} menit.</strong>
                  <br />
                  Silakan simpan pekerjaan Anda dan bersiap untuk login ulang.
                </>
              )}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isExpired && (
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mengerti
              </button>
            )}
            <button
              onClick={onLoginRedirect}
              className={`${isExpired ? 'w-full' : 'flex-1'} px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                isExpired ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isExpired ? 'Login Ulang' : 'Login Sekarang'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenExpirationModal;