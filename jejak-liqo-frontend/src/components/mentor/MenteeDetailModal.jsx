import React from 'react';
import { User, Edit, X } from 'lucide-react';

const MenteeDetailModal = ({ isOpen, mentee, onClose, onEdit }) => {
  if (!isOpen || !mentee) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Detail Mentee
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={onEdit}
              className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit Mentee"
            >
              <Edit size={16} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <User size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {mentee.full_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mentee.nickname}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{mentee.gender || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                {mentee.birth_date ? new Date(mentee.birth_date).toLocaleDateString('id-ID') : '-'}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{mentee.phone_number || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{mentee.activity_class || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hobi</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{mentee.hobby || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{mentee.status || '-'}</p>
            </div>
            <div className="sm:col-span-2">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</h4>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{mentee.address || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeDetailModal;