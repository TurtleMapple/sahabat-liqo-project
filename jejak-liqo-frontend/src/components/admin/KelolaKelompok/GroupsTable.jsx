import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus, Edit, Trash2 } from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';

const GroupsTable = ({ 
  groups, 
  loading, 
  pagination, 
  getGenderBadge, 
  openDetailModal, 
  setSelectedGroup, 
  setShowMenteeModal, 
  setShowDeleteModal,
  handlePageChange 
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                No
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Nama Kelompok
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Mentor
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Jumlah Mentees
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Gender
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Jumlah Pertemuan
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
                  <LoadingState type="dots" size="md" text="Memuat data kelompok..." />
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan="7" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tidak ada data kelompok
                </td>
              </tr>
            ) : (
              groups.map((group, index) => (
                <tr
                  key={group.id}
                  className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {((pagination.current_page - 1) * pagination.per_page) + index + 1}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <div>
                      <div className="font-medium">{group.group_name}</div>
                      {group.description && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {group.description.length > 50 ? `${group.description.substring(0, 50)}...` : group.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {group.mentor ? (
                      <div className="font-medium">
                        {group.mentor.name || group.mentor.email || `Mentor #${group.mentor.id}`}
                      </div>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                        Belum Memiliki Mentor
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      isDark ? 'bg-blue-900/20 text-blue-400 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {group.mentees_count || 0} mentees
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {getGenderBadge(group.gender_distribution)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      isDark ? 'bg-green-900/20 text-green-400 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {group.meetings_count || 0} pertemuan
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDetailModal(group)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/kelola-kelompok/edit/${group.id}`)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {setSelectedGroup(group); setShowDeleteModal(true);}}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className={`px-6 py-3 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className={`px-3 py-1 rounded ${
                  pagination.current_page === 1 
                    ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Sebelumnya
              </button>
              
              {[...Array(pagination.last_page)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === pagination.last_page ||
                  (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        page === pagination.current_page
                          ? 'bg-blue-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === pagination.current_page - 2 ||
                  page === pagination.current_page + 2
                ) {
                  return <span key={page} className={`px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className={`px-3 py-1 rounded ${
                  pagination.current_page === pagination.last_page 
                    ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsTable;