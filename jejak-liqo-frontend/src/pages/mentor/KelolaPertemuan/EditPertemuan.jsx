import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, FileText, Save, Camera, UserCheck } from 'lucide-react';
import { getMeetingDetail, updateMeeting } from '../../../api/mentor';
import Layout from '../../../components/mentor/Layout';

const EditPertemuan = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    meeting_date: '',
    meeting_type: 'offline',
    place: '',
    notes: ''
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [attendances, setAttendances] = useState({});
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpha: 0
  });

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      const response = await getMeetingDetail(meetingId);
      const meeting = response.data;
      
      setFormData({
        topic: meeting.title || '',
        meeting_date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : '',
        meeting_type: meeting.type || 'offline',
        place: meeting.location || '',
        notes: meeting.notes || ''
      });
      setExistingPhotos(meeting.photos || []);
      
      // Set mentees dan attendance data
      if (meeting.mentees) {
        setMentees(meeting.mentees);
        const attendanceMap = {};
        meeting.mentees.forEach(mentee => {
          attendanceMap[mentee.id] = mentee.status || 'hadir';
        });
        setAttendances(attendanceMap);
        console.log('Mentees loaded:', meeting.mentees);
        console.log('Attendances loaded:', attendanceMap);
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Gagal memuat data pertemuan';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Debug: cek formData yang ada
    console.log('Current formData:', formData);
    
    // Test dengan data minimal dulu
    const testData = {
      topic: formData.topic,
      meeting_date: formData.meeting_date,
      meeting_type: formData.meeting_type,
      place: formData.place,
      notes: formData.notes || ''
    };

    console.log('Test data:', testData);
    console.log('Field values:', {
      topic: `'${formData.topic}'`,
      meeting_date: `'${formData.meeting_date}'`,
      meeting_type: `'${formData.meeting_type}'`,
      place: `'${formData.place}'`
    });

    // Test dengan JSON dulu (tanpa foto)
    let submitData;
    if (newPhotos.length > 0 || existingPhotos.length > 0) {
      // Jika ada foto, gunakan FormData
      submitData = new FormData();
      Object.keys(testData).forEach(key => {
        submitData.append(key, testData[key]);
      });
      
      if (existingPhotos.length > 0) {
        submitData.append('existing_photos', JSON.stringify(existingPhotos));
      }
      
      newPhotos.forEach((photo, index) => {
        submitData.append(`photos[${index}]`, photo);
      });
      
      // Tambahkan attendance data
      const attendanceArray = Object.keys(attendances).map(menteeId => ({
        mentee_id: parseInt(menteeId),
        status: attendances[menteeId]
      }));
      submitData.append('attendances', JSON.stringify(attendanceArray));
    } else {
      // Jika tidak ada foto, gunakan JSON biasa
      const attendanceArray = Object.keys(attendances).map(menteeId => ({
        mentee_id: parseInt(menteeId),
        status: attendances[menteeId]
      }));
      
      submitData = {
        ...testData,
        existing_photos: JSON.stringify(existingPhotos),
        attendances: attendanceArray
      };
    }

    try {
      if (submitData instanceof FormData) {
        console.log('FormData being sent:', Object.fromEntries(submitData.entries()));
      } else {
        console.log('JSON data being sent:', submitData);
      }
      
      await updateMeeting(meetingId, submitData);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Pertemuan berhasil diperbarui';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
      
      navigate('/mentor/catatan-pertemuan');
    } catch (error) {
      console.error('Error updating meeting:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Log each validation error in detail
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(field => {
          console.error(`${field}:`, error.response.data.errors[field]);
        });
      }
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = error.response?.data?.message || 'Gagal memperbarui pertemuan';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceChange = (menteeId, status) => {
    console.log('Changing attendance:', menteeId, 'to', status);
    setAttendances(prev => {
      const newAttendances = {
        ...prev,
        [menteeId]: status
      };
      console.log('New attendances:', newAttendances);
      return newAttendances;
    });
  };

  // Update statistik kehadiran saat attendances berubah
  useEffect(() => {
    const stats = {
      total: mentees.length,
      hadir: Object.values(attendances).filter(status => status === 'hadir').length,
      sakit: Object.values(attendances).filter(status => status === 'sakit').length,
      izin: Object.values(attendances).filter(status => status === 'izin').length,
      alpha: Object.values(attendances).filter(status => status === 'alpha').length
    };
    console.log('Updated stats:', stats);
    console.log('Current attendances:', attendances);
    setAttendanceStats(stats);
  }, [attendances, mentees]);

  return (
    <Layout activeMenu="Pertemuan">
      <div className="p-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-6">
              <button 
                onClick={() => navigate('/mentor/catatan-pertemuan')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Edit Pertemuan
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Perbarui informasi pertemuan
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topik Pertemuan
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan topik pertemuan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meeting Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Pertemuan
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="meeting_date"
                    value={formData.meeting_date}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Pertemuan
                </label>
                <select
                  name="meeting_type"
                  value={formData.meeting_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            {/* Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tempat Pertemuan
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="place"
                  value={formData.place}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan tempat pertemuan"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Tambahkan catatan pertemuan..."
              />
            </div>

            {/* Photo Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto Pertemuan
              </label>
              
              {existingPhotos.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Saat Ini</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Existing photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setExistingPhotos(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center">
                  <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                  <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload foto baru</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewPhotos(Array.from(e.target.files))}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              {newPhotos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Baru</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`New photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setNewPhotos(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Management */}
            {mentees.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Daftar Kehadiran Mentee
                </label>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Daftar Kehadiran Mentee</h3>
                    <button 
                      type="button" 
                      onClick={() => {
                        const resetAttendances = {};
                        mentees.forEach(mentee => {
                          resetAttendances[mentee.id] = 'hadir';
                        });
                        setAttendances(resetAttendances);
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{attendanceStats.total}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-xs text-green-600 dark:text-green-400">Hadir</p>
                      </div>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {attendanceStats.hadir}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Sakit</p>
                      </div>
                      <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {attendanceStats.sakit}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Izin</p>
                      </div>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {attendanceStats.izin}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <p className="text-xs text-red-600 dark:text-red-400">Alpha</p>
                      </div>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {attendanceStats.alpha}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {mentees.map((mentee) => {
                      const status = attendances[mentee.id] || 'hadir';
                      const getStatusColor = (status) => {
                        switch(status) {
                          case 'hadir': return 'text-green-600 dark:text-green-400';
                          case 'sakit': return 'text-yellow-600 dark:text-yellow-400';
                          case 'izin': return 'text-blue-600 dark:text-blue-400';
                          case 'alpha': return 'text-red-600 dark:text-red-400';
                          default: return 'text-gray-600 dark:text-gray-400';
                        }
                      };
                      
                      return (
                        <div key={mentee.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check text-green-600 dark:text-green-400">
                              <path d="m16 11 2 2 4-4"></path>
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{mentee.full_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {mentee.nickname || 'Tidak ada panggilan'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium capitalize ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            <select 
                              value={status}
                              onChange={(e) => handleAttendanceChange(mentee.id, e.target.value)}
                              className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="hadir">Hadir</option>
                              <option value="sakit">Sakit</option>
                              <option value="izin">Izin</option>
                              <option value="alpha">Alpha</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/mentor/catatan-pertemuan')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
};

export default EditPertemuan;