import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Calendar, Users, Download, Eye } from 'lucide-react';
import LoadingState from '../../common/LoadingState';

const ReportForm = ({ formData, onChange, onPreview, onDownload, loading, hasReportData }) => {
  const { isDark } = useTheme();

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg h-fit`}
    >
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Form Generator
        </h3>
      </div>

      <div className="space-y-6">
        {/* Periode */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Periode Laporan
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dari
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.fromMonth}
                  onChange={(e) => onChange('fromMonth', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.fromYear}
                  onChange={(e) => onChange('fromYear', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sampai
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.toMonth}
                  onChange={(e) => onChange('toMonth', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.toYear}
                  onChange={(e) => onChange('toYear', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Kelompok */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Kelompok
          </label>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="groupType"
                value="all"
                checked={formData.groupType === 'all'}
                onChange={(e) => onChange('groupType', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Semua Kelompok
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="groupType"
                value="ikhwan"
                checked={formData.groupType === 'ikhwan'}
                onChange={(e) => onChange('groupType', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Kelompok Ikhwan (Semua)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="groupType"
                value="akhwat"
                checked={formData.groupType === 'akhwat'}
                onChange={(e) => onChange('groupType', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Kelompok Akhwat (Semua)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="groupType"
                value="custom"
                checked={formData.groupType === 'custom'}
                onChange={(e) => onChange('groupType', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Pilih Kelompok Tertentu
              </span>
              {formData.groupType === 'custom' && (
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  {formData.selectedGroups.length} dipilih
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onPreview}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <LoadingState type="dots" size="sm" />
            ) : (
              <>
                <Eye size={18} />
                <span>Preview Laporan</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onDownload('pdf')}
              disabled={!hasReportData}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => onDownload('excel')}
              disabled={!hasReportData}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportForm;