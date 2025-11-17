import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import { ArrowLeft, RotateCcw, Trash2, Eye, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import LoadingState from '../../../components/common/LoadingState';

const RecycleBinMentee = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchDeletedMentees();
  }, []);

  const fetchDeletedMentees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentees/trashed');
      setMentees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching deleted mentees:', error);
      toast.error('Gagal memuat data mentee yang dihapus');
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      await api.post(`/mentees/${selectedMentee.id}/restore`);
      toast.success('Mentee berhasil dipulihkan');
      setShowRestoreModal(false);
      setSelectedMentee(null);
      fetchDeletedMentees();
    } catch (error) {
      console.error('Error restoring mentee:', error);
      toast.error('Gagal memulihkan mentee');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await api.delete(`/mentees/${selectedMentee.id}/force`);
      toast.success('Mentee berhasil dihapus permanen');
      setShowDeleteModal(false);
      setSelectedMentee(null);
      fetchDeletedMentees();
    } catch (error) {
      console.error('Error permanently deleting mentee:', error);
      toast.error('Gagal menghapus mentee secara permanen');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const menteesToDelete = selectedMentees.length > 0 ? selectedMentees : mentees.map(m => m.id);
      await Promise.all(menteesToDelete.map(id => api.delete(`/mentees/${id}/force`)));
      toast.success(`${menteesToDelete.length} mentee berhasil dihapus permanen`);
      setShowDeleteAllModal(false);
      setSelectedMentees([]);
      setSelectAll(false);
      fetchDeletedMentees();
    } catch (error) {
      console.error('Error deleting all mentees:', error);
      toast.error('Gagal menghapus mentee secara permanen');
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedMentees(mentees.map(m => m.id));
    } else {
      setSelectedMentees([]);
    }
  };

  const handleSelectMentee = (menteeId, checked) => {
    if (checked) {
      setSelectedMentees([...selectedMentees, menteeId]);
    } else {
      setSelectedMentees(selectedMentees.filter(id => id !== menteeId));
      setSelectAll(false);
    }
  };

  return (
    <Layout activeMenu="Kelola Mentee">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
                Recycle Bin Mentee
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard → Kelola Mentee → Recycle Bin
              </p>
            </div>
          </div>
          {mentees.length > 0 && (
            <div className="flex items-center space-x-3">
              {selectedMentees.length > 0 && (
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedMentees.length} dipilih
                </span>
              )}
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash size={16} />
                <span>{selectedMentees.length > 0 ? 'Hapus Terpilih' : 'Hapus Semua'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    No
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Nama
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Gender
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Telepon
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Dihapus Pada
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4">
                      <LoadingState type="dots" size="md" text="Memuat data recycle bin..." />
                    </td>
                  </tr>
                ) : mentees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Trash2 size={24} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                        </div>
                        <div>
                          <p className="font-medium">Tidak ada mentee yang dihapus</p>
                          <p className="text-sm mt-1">Data yang dihapus akan muncul di sini</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mentees.map((mentee, index) => (
                    <motion.tr
                      key={mentee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <input
                          type="checkbox"
                          checked={selectedMentees.includes(mentee.id)}
                          onChange={(e) => handleSelectMentee(mentee.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {index + 1}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{mentee.full_name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {mentee.nickname || '-'}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.gender === 'Ikhwan' ? 'Ikhwan' : mentee.gender === 'Akhwat' ? 'Akhwat' : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.phone_number || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.deleted_at ? new Date(mentee.deleted_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {setSelectedMentee(mentee); setShowDetailModal(true);}}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Detail"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {setSelectedMentee(mentee); setShowRestoreModal(true);}}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Pulihkan"
                          >
                            <RotateCcw size={18} />
                          </button>
                          <button
                            onClick={() => {setSelectedMentee(mentee); setShowDeleteModal(true);}}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Hapus Permanen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMentee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detail Mentee (Dihapus)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Lengkap</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.full_name}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Panggilan</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.nickname || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Jenis Kelamin</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedMentee.gender === 'Ikhwan' ? 'Ikhwan (Laki-laki)' : selectedMentee.gender === 'Akhwat' ? 'Akhwat (Perempuan)' : '-'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Lahir</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedMentee.birth_date ? new Date(selectedMentee.birth_date).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nomor Telepon</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.phone_number || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelas Aktivitas</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.activity_class || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Hobi</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.hobby || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedMentee.status === 'Aktif' 
                      ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                      : isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedMentee.status}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Alamat</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.address || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Dihapus Pada</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedMentee.deleted_at ? new Date(selectedMentee.deleted_at).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Pulihkan Mentee
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin memulihkan mentee <strong>{selectedMentee?.full_name}</strong>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Pulihkan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Hapus Permanen
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus permanen mentee <strong>{selectedMentee?.full_name}</strong>? 
                <br /><span className="text-red-500">Tindakan ini tidak dapat dibatalkan!</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Hapus Semua Mentee
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedMentees.length > 0 
                  ? `Apakah Anda yakin ingin menghapus permanen ${selectedMentees.length} mentee yang dipilih?`
                  : `Apakah Anda yakin ingin menghapus permanen semua ${mentees.length} mentee?`
                }
                <br /><span className="text-red-500">Tindakan ini tidak dapat dibatalkan!</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default RecycleBinMentee;