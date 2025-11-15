import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../contexts/ThemeContext';
import { X, Calendar, Download, FileText, BarChart3, Users, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const YearlyReportModal = ({ show, onClose }) => {
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    groupType: 'all'
  });
  
  const [loading, setLoading] = useState(false);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownload = async (format) => {
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()}...`);
    setLoading(true);

    try {
      const endpoint = format === 'pdf' ? 'export-pdf' : 'export-excel';
      const fileExtension = format === 'pdf' ? 'pdf' : 'xls';
      
      const url = `http://localhost:8000/api/yearly-reports/${endpoint}?year=${formData.year}&group_type=${formData.groupType}`;
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        const groupTypeText = formData.groupType === 'all' ? 'semua_kelompok' : formData.groupType;
        a.download = `laporan_tahunan_${formData.year}_${groupTypeText}.${fileExtension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        toast.dismiss(loadingToast);
        toast.success(`${format.toUpperCase()} berhasil didownload`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.dismiss(loadingToast);
        toast.error(errorData.message || `Gagal mendownload ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      toast.dismiss(loadingToast);
      toast.error(`Gagal mendownload ${format.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-blue-600" />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Laporan Tahunan
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Filter className="text-blue-600" size={20} />
                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Parameter Laporan
                    </h4>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Year Selection */}
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Calendar size={16} className="text-blue-600" />
                        Tahun Laporan
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => handleFormChange('year', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {Array.from({ length: 11 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Group Type Selection */}
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Users size={16} className="text-blue-600" />
                        Kategori Kelompok
                      </label>
                      <select
                        value={formData.groupType}
                        onChange={(e) => handleFormChange('groupType', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Semua Kelompok</option>
                        <option value="ikhwan">Kelompok Ikhwan</option>
                        <option value="akhwat">Kelompok Akhwat</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Download Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Download className="text-green-600" size={20} />
                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Export Laporan
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <FileText size={20} />
                      <span className="font-medium">Download PDF</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownload('excel')}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <BarChart3 size={20} />
                      <span className="font-medium">Download Excel</span>
                    </button>
                  </div>
                  
                  {/* Info Section */}
                  <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Format Laporan:
                    </h5>
                    <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <li>• Tabel dengan kolom No, KPAA, Kelompok</li>
                      <li>• Data pertemuan Januari - Desember</li>
                      <li>• Jumlah pertemuan setiap kelompok</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default YearlyReportModal;