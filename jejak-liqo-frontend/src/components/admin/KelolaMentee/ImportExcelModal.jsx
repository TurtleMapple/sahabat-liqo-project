import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Upload, X } from 'lucide-react';

const ImportExcelModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fileName, 
  loading 
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md mx-4 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Konfirmasi Import Excel
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className={`mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            File: <span className="font-medium">{fileName}</span>
          </p>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Pastikan file Excel sesuai dengan template yang telah didownload.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Import</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExcelModal;