import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Users, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const AdminDetailModal = ({ isOpen, onClose, admin }) => {
  const { isDark } = useTheme();
  if (!isOpen || !admin) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Detail Admin</h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Section */}
            <div className="flex items-start space-x-6 mb-8">
              {admin.foto_profil ? (
                <img 
                  src={admin.foto_profil} 
                  alt={admin.nama_lengkap}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-[#4DABFF]/20"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-4 border-[#4DABFF]/20">
                  {admin.nama_lengkap.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div className="flex-1">
                <h4 className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{admin.nama_lengkap}</h4>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>{admin.peran}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    admin.status === 'Aktif'
                      ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                      : admin.status === 'Terblokir'
                      ? isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                      : isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                  }`}>{admin.status}</span>
                  {admin.gender && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      admin.gender === 'Ikhwan'
                        ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                        : isDark ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-800'
                    }`}>{admin.gender}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kontak */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h5 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Kontak</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <div>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Email</p>
                      <p className={`font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>{admin.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <div>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>No. Telepon</p>
                      <p className={`font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>{admin.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Personal */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h5 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Informasi Personal</h5>
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Nickname</p>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{admin.nickname || '-'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Tanggal Lahir</p>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{formatDate(admin.birth_date)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Pekerjaan</p>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{admin.job || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Alamat & Hobi */}
              <div className={`p-4 rounded-xl md:col-span-2 ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h5 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Lainnya</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs mb-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Alamat</p>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{admin.alamat || '-'}</p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Hobi</p>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{admin.hobby || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Status & Tanggal */}
              <div className={`p-4 rounded-xl md:col-span-2 ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h5 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Status & Aktivitas</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs mb-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Bergabung</p>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{admin.tanggal_bergabung || '-'}</p>
                  </div>
                  {admin.blocked_at && (
                    <div>
                      <p className={`text-xs mb-1 text-red-500`}>Diblokir</p>
                      <p className={`font-medium text-red-600 dark:text-red-400`}>
                        {formatDateTime(admin.blocked_at)}
                      </p>
                    </div>
                  )}
                  {admin.status_note && (
                    <div className="md:col-span-2">
                      <p className={`text-xs mb-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Catatan Status</p>
                      <p className={`font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>{admin.status_note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminDetailModal;