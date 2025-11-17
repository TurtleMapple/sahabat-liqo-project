import api from './axiosInstance';

const meetingsAPI = {
  // Get all meetings with filters
  getMeetings: (params = {}) => {
    return api.get('/meetings', { params });
  },

  // Get meeting by ID
  getMeeting: (id) => {
    return api.get(`/meetings/${id}`);
  },

  // Create new meeting
  createMeeting: (data) => {
    return api.post('/meetings', data);
  },

  // Update meeting
  updateMeeting: (id, data) => {
    return api.put(`/meetings/${id}`, data);
  },

  // Delete meeting
  deleteMeeting: (id) => {
    return api.delete(`/meetings/${id}`);
  },

  // Get meeting statistics
  getStatistics: () => {
    return api.get('/meetings/statistics');
  },

  // Get groups for dropdown
  getGroups: () => {
    return api.get('/meetings/groups');
  },

  // Get mentees from a specific group
  getGroupMentees: (groupId) => {
    return api.get(`/groups/${groupId}`);
  },

  // Trashed meetings
  getTrashedMeetings: (params = {}) => {
    return api.get('/meetings/trashed', { params });
  },

  // Restore meeting
  restoreMeeting: (id) => {
    return api.post(`/meetings/${id}/restore`);
  },

  // Force delete meeting
  forceDeleteMeeting: (id) => {
    return api.delete(`/meetings/${id}/force`);
  },

  // Bulk restore meetings
  bulkRestoreMeetings: (ids) => {
    return api.post('/meetings/bulk-restore', { ids });
  },

  // Bulk force delete meetings
  bulkForceDeleteMeetings: (ids) => {
    return api.post('/meetings/bulk-force-delete', { ids });
  },
};

export default meetingsAPI;