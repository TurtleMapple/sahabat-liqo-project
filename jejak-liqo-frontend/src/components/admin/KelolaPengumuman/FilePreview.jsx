import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { X, Download, Eye, FileText, Image, File, ExternalLink } from 'lucide-react';

const FilePreview = ({ isOpen, onClose, file, fileUrl, fileName, fileType }) => {
  const { isDark } = useTheme();
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  
  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenExternal = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const getFileIcon = () => {
    if (isImage) return <Image className="w-16 h-16 text-green-500" />;
    if (isPDF) return <FileText className="w-16 h-16 text-red-500" />;
    return <File className="w-16 h-16 text-gray-500" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Eye className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Preview File
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {fileName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {fileUrl && (
                <>
                  <button
                    onClick={handleOpenExternal}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Buka di tab baru"
                  >
                    <ExternalLink size={18} />
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Download file"
                  >
                    <Download size={18} />
                  </button>
                </>
              )}
              
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
            {isImage && fileUrl && !imageError ? (
              <div className="flex justify-center">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : isPDF && fileUrl ? (
              <div className="w-full h-[60vh]">
                <iframe
                  src={`${fileUrl}#toolbar=0`}
                  className="w-full h-full rounded-lg border"
                  title={fileName}
                />
              </div>
            ) : (
              // Fallback for unsupported files or errors
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                {getFileIcon()}
                <div className="text-center">
                  <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {fileName}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isImage && imageError 
                      ? 'Gagal memuat gambar' 
                      : 'Preview tidak tersedia untuk tipe file ini'
                    }
                  </p>
                  {fileUrl && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleOpenExternal}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <ExternalLink size={16} />
                        Buka di Tab Baru
                      </button>
                      
                      <button
                        onClick={handleDownload}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilePreview;