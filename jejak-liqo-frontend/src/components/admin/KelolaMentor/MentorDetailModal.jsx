import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

const MentorDetailModal = ({ show, onClose, mentor }) => {
  const { isDark } = useTheme();

  if (!mentor) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full max-w-4xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Detail Mentor
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    mentor.blocked_at
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : (mentor.profile?.status || 'Aktif') === 'Aktif' 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      mentor.blocked_at
                        ? 'bg-red-500'
                        : (mentor.profile?.status || 'Aktif') === 'Aktif'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`} />
                    {mentor.blocked_at ? 'Terblokir' : (mentor.profile?.status || 'Aktif')}
                  </span>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {/* Informasi Pribadi */}
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Informasi Pribadi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Lengkap</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.profile?.full_name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Panggilan</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.profile?.nickname || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Jenis Kelamin</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mentor.profile?.gender === 'Ikhwan' ? 'Ikhwan (Laki-laki)' : mentor.profile?.gender === 'Akhwat' ? 'Akhwat (Perempuan)' : '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Lahir</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mentor.profile?.birth_date ? new Date(mentor.profile.birth_date).toLocaleDateString('id-ID') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informasi Kontak */}
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Informasi Kontak</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nomor Telepon</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.profile?.phone_number || '-'}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Alamat</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.profile?.address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Lainnya */}
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Informasi Lainnya</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Pekerjaan</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.profile?.job || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Hobi</label>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.profile?.hobby || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Statistik Mentoring */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Statistik Mentoring</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Jumlah Kelompok</label>
                      <p className={`text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{mentor.groups_count || 0} kelompok</p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Jumlah Mentee</label>
                      <p className={`text-base font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{mentor.mentees_count || 0} mentee</p>
                    </div>
                  </div>
                  {mentor.blocked_at && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="space-y-1">
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Diblokir</label>
                        <p className={`text-base text-red-600`}>
                          {new Date(mentor.blocked_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MentorDetailModal;