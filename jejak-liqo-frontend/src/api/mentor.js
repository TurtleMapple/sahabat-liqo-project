import api from './axiosInstance';

// ===== ADMIN FUNCTIONS - Kelola Mentor =====

// Get mentors with filters and pagination
export const getMentors = async (params = {}) => {
  const response = await api.get('/mentors', { params });
  return response.data;
};

// Get mentor statistics
export const getMentorStats = async () => {
  const response = await api.get('/mentors/stats');
  return response.data;
};

// Get single mentor
export const getMentor = async (id) => {
  const response = await api.get(`/mentors/${id}`);
  return response.data;
};

// Create mentor
export const createMentor = async (data) => {
  const response = await api.post('/mentors', data);
  return response.data;
};

// Update mentor
export const updateMentor = async (id, data) => {
  const response = await api.put(`/mentors/${id}`, data);
  return response.data;
};

// Delete mentor (soft delete)
export const deleteMentor = async (id) => {
  const response = await api.delete(`/mentors/${id}`);
  return response.data;
};

// Block mentor
export const blockMentor = async (id) => {
  const response = await api.put(`/mentors/${id}/block`);
  return response.data;
};

// Unblock mentor
export const unblockMentor = async (id) => {
  const response = await api.put(`/mentors/${id}/unblock`);
  return response.data;
};

// Get deleted mentors
export const getDeletedMentors = async (params = {}) => {
  const response = await api.get('/mentors/trashed', { params });
  return response.data;
};

// Restore mentor
export const restoreMentor = async (id) => {
  const response = await api.post(`/mentors/${id}/restore`);
  return response.data;
};

// Get mentor force delete info
export const getMentorForceInfo = async (id) => {
  const response = await api.get(`/mentors/${id}/force-info`);
  return response.data;
};

// Force delete mentor
export const forceDeleteMentor = async (id) => {
  const response = await api.delete(`/mentors/${id}/force`);
  return response.data;
};

// ===== MENTOR ROLE FUNCTIONS =====

// Dashboard
export const getMentorDashboardStats = async () => {
  const response = await api.get('/mentor/dashboard/stats');
  return response.data;
};

// Groups
export const getMentorGroups = async () => {
  const response = await api.get('/mentor/groups');
  return response.data;
};

export const getMentorGroupDetail = async (groupId) => {
  const response = await api.get(`/mentor/groups/${groupId}`);
  return response.data;
};

export const createMentorGroup = async (groupData) => {
  const response = await api.post('/mentor/groups', groupData);
  return response.data;
};

// Mentees Management
export const addMentees = async (groupId, menteesData) => {
  const response = await api.post(`/mentor/groups/${groupId}/mentees`, {
    mentees: menteesData
  });
  return response.data;
};

export const removeMenteeFromGroup = async (menteeId) => {
  const response = await api.delete(`/mentor/mentees/${menteeId}?action=remove`);
  return response.data;
};

export const deleteMentee = async (menteeId) => {
  const response = await api.delete(`/mentor/mentees/${menteeId}`);
  return response.data;
};

export const addAvailableMenteesToGroup = async (groupId, menteeIds) => {
  const response = await api.patch(`/mentor/groups/${groupId}/add-mentees`, {
    mentee_ids: menteeIds
  });
  return response.data;
};

export const moveMenteesToGroup = async (groupId, menteeIds) => {
  const response = await api.put(`/mentor/groups/${groupId}/move-mentees`, {
    mentee_ids: menteeIds
  });
  return response.data;
};

// Groups Management
export const updateMentorGroup = async (groupId, groupData) => {
  const response = await api.put(`/mentor/groups/${groupId}`, groupData);
  return response.data;
};

export const deleteMentorGroup = async (groupId) => {
  const response = await api.delete(`/mentor/groups/${groupId}`);
  return response.data;
};

export const getTrashedGroups = async () => {
  const response = await api.get('/mentor/groups/trashed');
  return response.data;
};

export const restoreGroup = async (groupId) => {
  const response = await api.post(`/mentor/groups/${groupId}/restore`);
  return response.data;
};

export const getGroupMentees = async (groupId, params = {}) => {
  const response = await api.get(`/mentor/groups/${groupId}/mentees`, { params });
  return response.data;
};

export const getGroupAllMentees = async (groupId) => {
  const response = await api.get(`/mentor/groups/${groupId}/all-mentees`);
  return response.data;
};

// Meetings
export const getMentorMeetings = async () => {
  const response = await api.get('/mentor/meetings');
  return response.data;
};

export const getMentorMeetingDetail = async (meetingId) => {
  const response = await api.get(`/mentor/meetings/${meetingId}`);
  return response.data;
};

export const createMentorMeeting = async (meetingData) => {
  const formData = new FormData();
  
  // Add regular fields
  Object.keys(meetingData).forEach(key => {
    if (key === 'photos') {
      // Handle photos separately
      if (meetingData.photos && meetingData.photos.length > 0) {
        meetingData.photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo);
        });
      }
    } else if (key === 'attendances') {
      // Handle attendances as JSON
      formData.append('attendances', JSON.stringify(meetingData.attendances));
    } else {
      formData.append(key, meetingData[key]);
    }
  });
  
  const response = await api.post('/mentor/meetings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateMentorMeeting = async (meetingId, meetingData) => {
  // Jika FormData, gunakan POST dengan _method override
  if (meetingData instanceof FormData) {
    meetingData.append('_method', 'PUT');
    const response = await api.post(`/mentor/meetings/${meetingId}`, meetingData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } else {
    // Jika JSON biasa, gunakan PUT normal
    const response = await api.put(`/mentor/meetings/${meetingId}`, meetingData);
    return response.data;
  }
};

export const deleteMentorMeeting = async (meetingId) => {
  const response = await api.delete(`/mentor/meetings/${meetingId}`);
  return response.data;
};

export const getTrashedMeetings = async () => {
  const response = await api.get('/mentor/meetings/trashed');
  return response.data;
};

export const restoreMeeting = async (meetingId) => {
  const response = await api.post(`/mentor/meetings/${meetingId}/restore`);
  return response.data;
};

// Profile
export const getMentorProfile = async () => {
  const response = await api.get('/mentor/profile');
  return response.data;
};

// Announcements
export const getMentorAnnouncements = async (params = {}) => {
  const response = await api.get('/mentor/announcements', { params });
  return response.data;
};

// Aliases for backward compatibility
export const createMeeting = createMentorMeeting;
export const getMeetings = getMentorMeetings;
export const getMeetingDetail = getMentorMeetingDetail;
export const updateMeeting = updateMentorMeeting;
export const deleteMeeting = deleteMentorMeeting;