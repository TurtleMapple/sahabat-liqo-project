import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { X, Users, FileText } from 'lucide-react';
import LoadingState from '../../common/LoadingState';

const GroupDetailModal = ({ 
  isOpen, 
  onClose, 
  selectedGroup, 
  groupDetail, 
  detailLoading, 
  getGenderBadge 
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !selectedGroup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-4xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Detail Kelompok: {selectedGroup.group_name}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          </div>
          
          {detailLoading ? (
            <div className="py-12">
              <LoadingState type="dots" size="md" text="Memuat detail kelompok..." />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-6">
              {/* Informasi Dasar */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <FileText size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  <span>Informasi Dasar</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Kelompok</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{groupDetail?.group_name || selectedGroup.group_name}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Jenis Kelompok</label>
                    <div className="mt-1">{getGenderBadge(groupDetail?.gender_distribution || selectedGroup.gender_distribution)}</div>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Mentor</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {(groupDetail?.mentor || selectedGroup.mentor) ? (groupDetail?.mentor?.name || selectedGroup.mentor?.name) : 'Belum ada mentor'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Pertemuan</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                      {groupDetail?.meetings_count || selectedGroup.meetings_count || 0} pertemuan
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Deskripsi</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {groupDetail?.description || selectedGroup.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Mentees */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <Users size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
                  <span>Daftar Mentees ({groupDetail?.mentees_count || selectedGroup.mentees_count || 0})</span>
                </h4>
                {groupDetail?.mentees && groupDetail.mentees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupDetail.mentees.map((mentee, index) => (
                      <div key={mentee.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {index + 1}. {mentee.full_name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {mentee.birth_date ? new Date(mentee.birth_date).toLocaleDateString('id-ID') : 'Tanggal lahir tidak tersedia'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            mentee.gender === 'Ikhwan' 
                              ? (isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800')
                              : (isDark ? 'bg-pink-900/20 text-pink-400' : 'bg-pink-100 text-pink-800')
                          }`}>
                            {mentee.gender}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Belum ada mentees dalam kelompok ini</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupDetailModal;