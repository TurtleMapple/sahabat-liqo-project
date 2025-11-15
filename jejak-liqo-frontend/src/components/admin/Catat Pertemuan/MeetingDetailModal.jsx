import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  XMarkIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MeetingDetailModal = ({ isOpen, onClose, meeting }) => {
  const { isDark } = useTheme();

  if (!isOpen || !meeting) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Online':
        return '💻';
      case 'Offline':
        return '🏢';
      case 'Assignment':
        return '📝';
      default:
        return '📅';
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'Online': isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200',
      'Offline': isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200',
      'Assignment': isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${colors[type] || colors['Online']}`}>
        {getTypeIcon(type)} {type}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{getTypeIcon(meeting.meeting_type)}</div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {meeting.topic || 'Pertemuan Kelompok'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Detail catatan pertemuan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meeting Type Badge */}
          <div className="mb-6">
            {getTypeBadge(meeting.meeting_type)}
          </div>

          {/* Meeting Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Group Info */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <UserGroupIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Informasi Kelompok
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nama Kelompok</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {meeting.group?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mentor</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {meeting.group?.mentor?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Jumlah Mentees</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {meeting.group?.mentees_count || 0} orang
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting Details */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <CalendarDaysIcon className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Detail Pertemuan
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tanggal</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(meeting.meeting_date)}
                  </p>
                </div>
                {meeting.place && (
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tempat</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {meeting.place}
                    </p>
                  </div>
                )}
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tipe</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {meeting.meeting_type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {meeting.notes && (
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Catatan Pertemuan
                </h3>
              </div>
              <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed whitespace-pre-wrap`}>
                  {meeting.notes}
                </p>
              </div>
            </div>
          )}

          {/* Attendance Section */}
          {meeting.attendances && meeting.attendances.length > 0 && (
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <UserIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Daftar Kehadiran ({meeting.attendances.length} mentee)
                </h3>
              </div>
              
              {/* Attendance Stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <CheckCircleIcon className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Hadir</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    {meeting.attendances.filter(a => a.status === 'Hadir').length}
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                  <ExclamationTriangleIcon className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Sakit</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {meeting.attendances.filter(a => a.status === 'Sakit').length}
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <ClockIcon className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Izin</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    {meeting.attendances.filter(a => a.status === 'Izin').length}
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <XCircleIcon className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>Alpa</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    {meeting.attendances.filter(a => a.status === 'Alpa').length}
                  </p>
                </div>
              </div>

              {/* Attendance List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {meeting.attendances.map((attendance, index) => {
                  const getStatusIcon = (status) => {
                    switch (status) {
                      case 'Hadir':
                        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
                      case 'Sakit':
                        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
                      case 'Izin':
                        return <ClockIcon className="w-4 h-4 text-blue-500" />;
                      case 'Alpa':
                        return <XCircleIcon className="w-4 h-4 text-red-500" />;
                      default:
                        return <CheckCircleIcon className="w-4 h-4 text-gray-500" />;
                    }
                  };

                  const getStatusBadge = (status) => {
                    const colors = {
                      'Hadir': isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200',
                      'Sakit': isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
                      'Izin': isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200',
                      'Alpa': isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200',
                    };
                    return colors[status] || colors['Hadir'];
                  };

                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(attendance.status)}
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {attendance.mentee?.full_name || `Mentee ${index + 1}`}
                          </p>
                          {attendance.notes && (
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {attendance.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(attendance.status)}`}>
                        {attendance.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <ClockIcon className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Informasi Tambahan
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dibuat pada</p>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDateTime(meeting.created_at)}
                </p>
              </div>
              {meeting.updated_at !== meeting.created_at && (
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terakhir diperbarui</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDateTime(meeting.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MeetingDetailModal;