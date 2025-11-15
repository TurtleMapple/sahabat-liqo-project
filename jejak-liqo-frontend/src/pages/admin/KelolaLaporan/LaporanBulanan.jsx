import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportForm from '../../../components/admin/KelolaLaporan/ReportForm';
import ReportPreview from '../../../components/admin/KelolaLaporan/ReportPreview';
import GroupSelection from '../../../components/admin/KelolaLaporan/GroupSelection';

const LaporanBulanan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fromMonth: new Date().getMonth() + 1,
    fromYear: new Date().getFullYear(),
    toMonth: new Date().getMonth() + 1,
    toYear: new Date().getFullYear(),
    groupType: 'all',
    selectedGroups: []
  });
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGroupSelection, setShowGroupSelection] = useState(false);

  useEffect(() => {
    setShowGroupSelection(formData.groupType === 'custom');
  }, [formData.groupType]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_month: formData.fromMonth,
        from_year: formData.fromYear,
        to_month: formData.toMonth,
        to_year: formData.toYear,
        group_type: formData.groupType
      });

      if (formData.groupType === 'custom' && formData.selectedGroups.length > 0) {
        formData.selectedGroups.forEach(id => {
          params.append('selected_groups[]', id);
        });
      }

      const response = await fetch(`http://localhost:8000/api/monthly-reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        toast.success('Preview laporan berhasil dimuat');
      } else {
        toast.error('Gagal memuat preview laporan');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Gagal memuat preview laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    if (!reportData) {
      toast.error('Silakan preview laporan terlebih dahulu');
      return;
    }

    // Validation for custom group selection
    if (formData.groupType === 'custom' && formData.selectedGroups.length === 0) {
      toast.error('Silakan pilih minimal 1 kelompok');
      return;
    }

    const loadingToast = toast.loading(`Generating ${format.toUpperCase()}...`);

    try {
      const params = new URLSearchParams({
        from_month: formData.fromMonth,
        from_year: formData.fromYear,
        to_month: formData.toMonth,
        to_year: formData.toYear,
        group_type: formData.groupType
      });

      if (formData.groupType === 'custom' && formData.selectedGroups.length > 0) {
        formData.selectedGroups.forEach(id => {
          params.append('selected_groups[]', id);
        });
      }

      const endpoint = format === 'pdf' ? 'export-pdf' : 'export-excel';
      const fileExtension = format === 'pdf' ? 'pdf' : 'xls';
      
      const response = await fetch(`http://localhost:8000/api/monthly-reports/${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate proper filename
        const periodText = formData.fromMonth === formData.toMonth && formData.fromYear === formData.toYear
          ? `${formData.fromMonth}_${formData.fromYear}`
          : `${formData.fromMonth}_${formData.fromYear}_to_${formData.toMonth}_${formData.toYear}`;
        
        const groupTypeText = formData.groupType === 'all' ? 'semua_kelompok' : formData.groupType;
        
        a.download = `laporan_${periodText}_${groupTypeText}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
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
    }
  };

  return (
    <Layout activeMenu="Kelola Laporan">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/kelola-laporan')}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-md transition-colors`}
            >
              <ArrowLeft size={20} className={isDark ? 'text-white' : 'text-gray-600'} />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                <FileText size={32} className="text-blue-600" />
                Buat Laporan Bulanan
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Generate laporan pertemuan berdasarkan periode dan kelompok
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ReportForm
            formData={formData}
            onChange={handleFormChange}
            onPreview={handlePreview}
            onDownload={handleDownload}
            loading={loading}
            hasReportData={!!reportData}
          />
          <ReportPreview
            reportData={reportData}
            loading={loading}
          />
        </div>

        <AnimatePresence>
          {showGroupSelection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <GroupSelection
                selectedGroups={formData.selectedGroups}
                onSelectionChange={(groups) => handleFormChange('selectedGroups', groups)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default LaporanBulanan;