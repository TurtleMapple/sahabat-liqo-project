import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Eye, Edit, Trash2, User, Calendar, Clock, Megaphone } from 'lucide-react';
import StatusBadge from './StatusBadge';
import MDEditor from '@uiw/react-md-editor';

const AnnouncementCard = ({ announcement, onView, onEdit, onDelete, isSelected, onSelect, index = 0 }) => {
  const { isDark } = useTheme();

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

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    const textContent = content.replace(/[#*\[\]()]/g, ''); // Remove markdown syntax
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700 hover:shadow-2xl hover:border-blue-500/50' 
          : 'bg-white border-gray-100 hover:shadow-2xl hover:border-blue-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{announcement.title}</h3>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <User size={16} className="text-blue-500" />
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
            
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Calendar size={16} className="text-blue-500" />
              <span>{formatDate(announcement.event_at)}</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock size={16} className="text-blue-500" />
              <span>{formatTime(announcement.event_at)}</span>
            </div>
            
            {announcement.file_path && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                <span>📎</span>
                <span>Lampiran</span>
              </div>
            )}
            
            <StatusBadge eventAt={announcement.event_at} />
          </div>
        </div>
        
        <div className="ml-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ${
            isDark ? 'shadow-lg' : 'shadow-md'
          }`}>
            <Megaphone size={20} />
          </div>
        </div>
      </div>
      
      {/* Content Preview */}
      <div className={`mb-4 p-4 rounded-xl ${
        isDark ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <p className={`text-sm line-clamp-3 leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>{truncateContent(announcement.content)}</p>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={() => onSelect(announcement.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(announcement)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(announcement)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={() => onView(announcement)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              isDark 
                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Eye size={16} />
            <span className="font-medium">Baca Selengkapnya</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;