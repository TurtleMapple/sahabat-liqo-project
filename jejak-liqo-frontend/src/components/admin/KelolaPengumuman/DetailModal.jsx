import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, Calendar, Clock, Download } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

const DetailModal = ({ isOpen, onClose, announcement }) => {
  const { isDark } = useTheme();
  
  if (!isOpen || !announcement) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const handleDownload = () => {
    if (announcement?.file_path) {
      const fileUrl = `http://localhost:8000/storage/${announcement.file_path}`;
      window.open(fileUrl, '_blank');
    }
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
          className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 ${
            isDark ? 'border-blue-400' : 'border-blue-300'
          }`}>
            <h3 className="text-xl font-bold text-white">Detail Pengumuman</h3>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Title */}
            <div>
              <h4 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>{announcement.title}</h4>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className={`flex items-center space-x-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <User size={16} />
                  <span>{announcement.user?.profile?.full_name || announcement.user?.email || 'Unknown'}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    announcement.user?.role === 'admin' 
                      ? 'bg-blue-100 text-blue-600' 
                      : announcement.user?.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {announcement.user?.role === 'admin' ? 'Admin' : 
                     announcement.user?.role === 'super_admin' ? 'Super Admin' : 'User'}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Calendar size={16} />
                  <span>{formatDate(announcement.event_at)}</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock size={16} />
                  <span>{formatTime(announcement.event_at)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`} data-color-mode={isDark ? 'dark' : 'light'}>
                <MDEditor.Markdown 
                  source={announcement.content} 
                  style={{ 
                    backgroundColor: 'transparent',
                    color: isDark ? '#D1D5DB' : '#374151'
                  }}
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    )
                  }}
                />
              </div>
              
              {/* File Attachment */}
              {announcement.file_path && (
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      📎
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {announcement.file_path.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_/, '')}
                      </p>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{announcement.file_type || 'File'}</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Download size={14} />
                      <span>Buka</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
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

export default DetailModal;