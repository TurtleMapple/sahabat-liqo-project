import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import LoadingState from '../../../components/common/LoadingState';

const TambahMentee = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'

  const [loading, setLoading] = useState(false);
  
  // Single mentee form
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    nickname: '',
    birth_date: '',
    phone_number: '',
    activity_class: '',
    hobby: '',
    address: '',
    status: 'Aktif'
  });

  // Bulk mentees form
  const [bulkMentees, setBulkMentees] = useState([
    {
      full_name: '',
      gender: '',
      nickname: '',
      birth_date: '',
      phone_number: '',
      activity_class: '',
      hobby: '',
      address: '',
      status: 'Aktif'
    }
  ]);

  const [errors, setErrors] = useState({});



  const validateMentee = (mentee) => {
    const errors = {};
    
    if (!mentee.full_name || mentee.full_name.trim() === '') {
      errors.full_name = 'Nama lengkap wajib diisi';
    }
    
    if (mentee.full_name && mentee.full_name.length > 255) {
      errors.full_name = 'Nama lengkap maksimal 255 karakter';
    }
    
    if (!mentee.gender || mentee.gender.trim() === '') {
      errors.gender = 'Jenis kelamin wajib dipilih';
    }
    
    return errors;
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateMentee(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await api.post('/mentees', { ...formData, group_id: null });
      toast.success('Mentee berhasil ditambahkan');
      navigate('/admin/kelola-mentee');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(message => {
          toast.error(message);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menambahkan mentee');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const allErrors = {};
    let hasErrors = false;

    bulkMentees.forEach((mentee, index) => {
      const validationErrors = validateMentee(mentee);
      if (Object.keys(validationErrors).length > 0) {
        allErrors[index] = validationErrors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(allErrors);
      return;
    }

    try {
      setLoading(true);
      const menteesWithGroupId = bulkMentees.map(mentee => ({ ...mentee, group_id: null }));
      const response = await api.post('/mentees/bulk-store', { mentees: menteesWithGroupId });
      toast.success(`Berhasil menambahkan ${response.data.created_count || bulkMentees.length} mentee`);
      navigate('/admin/kelola-mentee');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(message => {
          toast.error(message);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menambahkan mentee');
      }
    } finally {
      setLoading(false);
    }
  };

  const addBulkMentee = () => {
    setBulkMentees([...bulkMentees, {
      full_name: '',
      gender: '',
      nickname: '',
      birth_date: '',
      phone_number: '',
      activity_class: '',
      hobby: '',
      address: '',
      status: 'Aktif'
    }]);
  };

  const removeBulkMentee = (index) => {
    if (bulkMentees.length > 1) {
      setBulkMentees(bulkMentees.filter((_, i) => i !== index));
    }
  };

  const updateBulkMentee = (index, field, value) => {
    const updated = [...bulkMentees];
    updated[index][field] = value;
    setBulkMentees(updated);
  };

  const renderFormFields = (data, onChange, errorPrefix = '') => (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => onChange('full_name', e.target.value)}
            placeholder="Masukkan nama lengkap mentee"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500 ${
              errors[`${errorPrefix}full_name`] ? 'border-red-500' : ''
            }`}
          />
          {errors[`${errorPrefix}full_name`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${errorPrefix}full_name`]}</p>
          )}
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Nama Panggilan
          </label>
          <input
            type="text"
            value={data.nickname}
            onChange={(e) => onChange('nickname', e.target.value)}
            placeholder="Nama panggilan (opsional)"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <select
            value={data.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500 ${
              errors[`${errorPrefix}gender`] ? 'border-red-500' : ''
            }`}
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Ikhwan">Ikhwan (Laki-laki)</option>
            <option value="Akhwat">Akhwat (Perempuan)</option>
          </select>
          {errors[`${errorPrefix}gender`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${errorPrefix}gender`]}</p>
          )}
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tanggal Lahir
          </label>
          <input
            type="date"
            value={data.birth_date}
            onChange={(e) => onChange('birth_date', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={data.phone_number}
            onChange={(e) => onChange('phone_number', e.target.value)}
            placeholder="08xxxxxxxxxx"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Kelas Aktivitas
          </label>
          <input
            type="text"
            value={data.activity_class}
            onChange={(e) => onChange('activity_class', e.target.value)}
            placeholder="Contoh: Kelas A, Tahfidz 1, dll"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Hobi
          </label>
          <input
            type="text"
            value={data.hobby}
            onChange={(e) => onChange('hobby', e.target.value)}
            placeholder="Hobi mentee"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Alamat
        </label>
        <textarea
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Alamat lengkap mentee"
          rows={3}
          className={`w-full px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } focus:ring-2 focus:ring-blue-500`}
        />
      </div>
    </div>
  );

  return (
    <Layout activeMenu="Kelola Mentee">
      <div className="p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/kelola-mentee')}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              } transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Tambah Mentee
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Mentee → Tambah Mentee
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode Selection */}
        <motion.div 
          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-6">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Mode:</span>
            <label className="flex items-center">
              <input
                type="radio"
                value="single"
                checked={mode === 'single'}
                onChange={(e) => setMode(e.target.value)}
                className="mr-2"
              />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Tambah Satu</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="bulk"
                checked={mode === 'bulk'}
                onChange={(e) => setMode(e.target.value)}
                className="mr-2"
              />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Tambah Multiple</span>
            </label>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div 
          className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6">
            {mode === 'single' ? (
              <form onSubmit={handleSingleSubmit}>
                {renderFormFields(
                  formData,
                  (field, value) => setFormData({ ...formData, [field]: value })
                )}
                
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-mentee')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : 'Simpan'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit}>
                <div className="space-y-6">
                  {bulkMentees.map((mentee, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg ${
                        isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Mentee #{index + 1}
                        </h3>
                        {bulkMentees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBulkMentee(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      
                      {renderFormFields(
                        mentee,
                        (field, value) => updateBulkMentee(index, field, value),
                        `${index}.`
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6">
                  <button
                    type="button"
                    onClick={addBulkMentee}
                    className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    <span>Tambah Mentee Lagi</span>
                  </button>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-mentee')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : `Simpan ${bulkMentees.length} Mentee`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TambahMentee;