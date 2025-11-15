import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { menteeAPI } from '../../../api/mentee';
import LoadingState from '../../common/LoadingState';
import { CalendarDaysIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

const MenteeDetailModal = ({ isOpen, onClose, mentee }) => {
  const { isDark } = useTheme();
  const [menteeStats, setMenteeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && mentee?.id) {
      fetchMenteeStats();
    }
  }, [isOpen, mentee?.id]);

  const fetchMenteeStats = async () => {
    try {
      setLoadingStats(true);
      const response = await menteeAPI.getMenteeStats(mentee.id);
      setMenteeStats(response.data.data);
    } catch (error) {
      console.error('Error fetching mentee stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && mentee && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-full max-w-2xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detail Mentee
              </h3>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelompok</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {mentee.group_id ? (
                        mentee.group ? 
                          mentee.group.group_name : 
                          `Kelompok ID: ${mentee.group_id}`
                      ) : 'Belum ada kelompok'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Lengkap</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.full_name}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Panggilan</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.nickname || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Jenis Kelamin</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {mentee.gender === 'Ikhwan' ? 'Ikhwan (Laki-laki)' : mentee.gender === 'Akhwat' ? 'Akhwat (Perempuan)' : '-'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Lahir</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {mentee.birth_date ? new Date(mentee.birth_date).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nomor Telepon</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.phone_number || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelas Aktivitas</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.activity_class || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Hobi</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.hobby || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Alamat</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{mentee.address || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mentee.status === 'Aktif' 
                        ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                        : isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {mentee.status}
                    </span>
                  </div>
                </div>
                
                {/* Meeting Statistics */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <ChartBarIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Statistik Pertemuan</h4>
                  </div>
                  
                  {loadingStats ? (
                    <LoadingState type="dots" size="sm" text="Memuat statistik..." />
                  ) : menteeStats ? (
                    <div className="space-y-4">
                      {/* Total Meetings */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Pertemuan</span>
                        </div>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {menteeStats.total_meetings} pertemuan
                        </span>
                      </div>
                      
                      {/* Attendance Percentage */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Persentase Kehadiran</span>
                        <span className={`font-bold text-lg ${
                          menteeStats.attendance_percentage >= 80 
                            ? 'text-green-500' 
                            : menteeStats.attendance_percentage >= 60 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                        }`}>
                          {menteeStats.attendance_percentage}%
                        </span>
                      </div>
                      
                      {/* Attendance Breakdown */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                          <CheckCircleIcon className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                          <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Hadir</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                            {menteeStats.total_present}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                          <ExclamationTriangleIcon className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                          <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Sakit</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                            {menteeStats.total_sakit}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                          <ClockIcon className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                          <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Izin</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                            {menteeStats.total_izin}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                          <XCircleIcon className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                          <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>Alpa</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                            {menteeStats.total_alpa}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Belum ada data pertemuan
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenteeDetailModal;