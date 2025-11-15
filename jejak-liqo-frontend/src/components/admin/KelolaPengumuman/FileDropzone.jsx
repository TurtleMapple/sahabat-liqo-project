import React, { useState, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FileDropzone = ({ onFileSelect, selectedFile, onRemoveFile, maxSize = 10 }) => {
  const { isDark } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);

  const allowedTypes = {
    'application/pdf': { icon: FileText, color: 'text-red-500', name: 'PDF' },
    'application/msword': { icon: FileText, color: 'text-blue-500', name: 'DOC' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500', name: 'DOCX' },
    'image/jpeg': { icon: Image, color: 'text-green-500', name: 'JPG' },
    'image/jpg': { icon: Image, color: 'text-green-500', name: 'JPG' },
    'image/png': { icon: Image, color: 'text-green-500', name: 'PNG' }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${maxSize}MB`);
      return false;
    }

    // Check file type
    if (!allowedTypes[file.type]) {
      toast.error('Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG');
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, maxSize]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const config = allowedTypes[fileType] || { icon: File, color: 'text-gray-500', name: 'File' };
    const Icon = config.icon;
    return <Icon className={`w-8 h-8 ${config.color}`} />;
  };

  return (
    <div>
      {selectedFile ? (
        // File Selected State
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile.type)}
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedFile.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatFileSize(selectedFile.size)} • {allowedTypes[selectedFile.type]?.name || 'Unknown'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className={`p-1 rounded-full transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        // Upload Zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? isDark 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-blue-500 bg-blue-50'
              : isDark 
                ? 'border-gray-600 hover:border-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
          />
          
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              isDragOver
                ? 'bg-blue-500/20'
                : isDark 
                  ? 'bg-gray-700' 
                  : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragOver
                  ? 'text-blue-500'
                  : isDark 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`} />
            </div>
            
            <div>
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <span className="text-blue-600 font-medium hover:text-blue-700">
                  Klik untuk upload
                </span>{' '}
                atau drag & drop file di sini
              </label>
              
              <div className="mt-2 space-y-1">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Maksimal {maxSize}MB
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Format: PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;