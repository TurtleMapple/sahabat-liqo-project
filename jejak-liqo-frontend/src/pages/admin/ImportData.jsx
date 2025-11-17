import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { downloadMenteeTemplate, importMentees } from '../../api/import';
import { Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const ImportData = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      await downloadMenteeTemplate();
      toast.success('Template berhasil didownload');
    } catch (error) {
      toast.error('Gagal download template');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        toast.error('File harus berformat Excel (.xlsx, .xls) atau CSV');
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      const result = await importMentees(file);
      
      if (result.status === 'success') {
        setImportResult(result);
        toast.success(result.message);
        if (result.failures_count > 0) {
          toast.error(`${result.failures_count} baris gagal diimport`);
        }
        setFile(null);
        document.getElementById('file-input').value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal import data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Import Data</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Import data mentee menggunakan file Excel</p>
      </div>

      {/* Import Mentee Section */}
      <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Import Data Mentee</h2>
        
        {/* Download Template */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Download size={20} className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>1. Download Template</h3>
          </div>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Download template Excel untuk format data mentee yang benar
          </p>
          <button
            onClick={handleDownloadTemplate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <FileText size={16} className="mr-2" />
            {loading ? 'Downloading...' : 'Download Template Mentee'}
          </button>
        </div>

        <hr className={`my-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

        {/* Upload File */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Upload size={20} className={`mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>2. Upload File Excel</h3>
          </div>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Pilih file Excel yang sudah diisi sesuai template
          </p>
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${
              isDark 
                ? 'text-gray-400 file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600'
                : 'text-gray-500 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            }`}
          />
          {file && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <CheckCircle size={16} className="mr-1" />
              File terpilih: {file.name}
            </p>
          )}
        </div>

        {/* Import Button */}
        <div className="mb-6">
          <h3 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>3. Import Data</h3>
          <button
            onClick={handleImport}
            disabled={loading || !file}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <Upload size={16} className="mr-2" />
            {loading ? 'Importing...' : 'Import Data Mentee'}
          </button>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Hasil Import:</h4>
            <div className="space-y-2">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {importResult.message}
              </p>
              {importResult.failures_count > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertCircle size={16} className="mr-1" />
                  <span className="text-sm">{importResult.failures_count} baris gagal diimport</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportData;