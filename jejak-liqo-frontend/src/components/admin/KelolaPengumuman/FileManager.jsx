import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FileText, Image, File, Download, Eye, X, Upload } from 'lucide-react';
import FilePreview from './FilePreview';

const FileManager = ({ 
  existingFile, 
  newFile, 
  onFileSelect, 
  onRemoveNewFile, 
  onRemoveExistingFile,
  maxSize = 10 
}) => {
  const { isDark } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-5 h-5 text-green-500" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (file, isExisting = false) => {
    if (isExisting) {
      setPreviewFile({
        name: file.name,
        type: file.type,
        url: `http://localhost:8000/storage/${file.path}`
      });
    } else {
      setPreviewFile({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      });
    }
    setShowPreview(true);
  };

  const handleDownload = (file) => {
    const fileUrl = `http://localhost:8000/storage/${file.path}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`Ukuran file maksimal ${maxSize}MB`);
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG');
        return;
      }

      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing File */}
      {existingFile && (
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(existingFile.type)}
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {existingFile.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  File saat ini
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePreview(existingFile, true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Preview file"
              >
                <Eye size={16} />
              </button>
              
              <button
                type="button"
                onClick={() => handleDownload(existingFile)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-green-400 hover:bg-green-500/10' 
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Download file"
              >
                <Download size={16} />
              </button>
              
              <button
                type="button"
                onClick={onRemoveExistingFile}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Hapus file"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File */}
      {newFile && (
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(newFile.type)}
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {newFile.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  File baru • {formatFileSize(newFile.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePreview(newFile, false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-blue-400 hover:bg-blue-500/20' 
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
                title="Preview file"
              >
                <Eye size={16} />
              </button>
              
              <button
                type="button"
                onClick={onRemoveNewFile}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-blue-400 hover:text-red-400 hover:bg-red-500/10' 
                    : 'text-blue-600 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Hapus file"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New File */}
      {!newFile && (
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDark 
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          <Upload className={`mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
          <input
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="new-file-upload"
          />
          <label
            htmlFor="new-file-upload"
            className={`cursor-pointer text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <span className="text-blue-600 font-medium hover:text-blue-700">
              {existingFile ? 'Upload file baru' : 'Klik untuk upload'}
            </span>{' '}
            atau drag & drop
          </label>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            PDF, DOC, DOCX, JPG, PNG (Max {maxSize}MB)
          </p>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreview
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewFile(null);
        }}
        fileUrl={previewFile?.url}
        fileName={previewFile?.name}
        fileType={previewFile?.type}
      />
    </div>
  );
};

export default FileManager;