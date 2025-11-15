import axiosInstance from './axiosInstance';

// Get all groups
export const getGroups = async (params = {}) => {
  return await axiosInstance.get('/groups', { params });
};

// Get single group
export const getGroup = async (id) => {
  return await axiosInstance.get(`/groups/${id}`);
};

// Get group by ID (alias for consistency)
export const getGroupById = async (id) => {
  return await axiosInstance.get(`/groups/${id}`);
};

// Create group
export const createGroup = async (data) => {
  return await axiosInstance.post('/groups', data);
};

// Update group
export const updateGroup = async (id, data) => {
  return await axiosInstance.put(`/groups/${id}`, data);
};

// Delete group
export const deleteGroup = async (id) => {
  return await axiosInstance.delete(`/groups/${id}`);
};

// Get groups statistics
export const getGroupsStats = async () => {
  return await axiosInstance.get('/groups/stats');
};

// Get groups statistics (new endpoint)
export const getGroupsStatistics = async () => {
  return await axiosInstance.get('/groups/statistics');
};

// Assign mentor to group
export const assignMentor = async (groupId, mentorId) => {
  return await axiosInstance.put(`/groups/${groupId}/assign-mentor`, { mentor_id: mentorId });
};

// Unassign mentor from group
export const unassignMentor = async (groupId) => {
  return await axiosInstance.put(`/groups/${groupId}/unassign-mentor`);
};

// Add mentees to group
export const addMenteesToGroup = async (groupId, menteeIds) => {
  return await axiosInstance.post(`/groups/${groupId}/mentees`, { mentee_ids: menteeIds });
};

// Remove mentees from group
export const removeMenteesFromGroup = async (groupId, menteeIds) => {
  return await axiosInstance.delete(`/groups/${groupId}/mentees`, { data: { mentee_ids: menteeIds } });
};

// Move mentees to another group
export const moveMentees = async (fromGroupId, toGroupId, menteeIds) => {
  return await axiosInstance.put(`/groups/${fromGroupId}/mentees/move`, { 
    to_group_id: toGroupId, 
    mentee_ids: menteeIds 
  });
};

// Helper endpoints for form
export const getAvailableMentors = async () => {
  return await axiosInstance.get('/groups/available-mentors');
};

export const getAvailableMentees = async (mentorId) => {
  return await axiosInstance.get(`/groups/available-mentees?mentor_id=${mentorId}`);
};

export const getMentorGender = async (mentorId) => {
  return await axiosInstance.get(`/groups/mentor-gender/${mentorId}`);
};

// Get mentees in a specific group
export const getGroupMentees = async (groupId) => {
  return await axiosInstance.get(`/groups/${groupId}/mentees`);
};

// Get all mentees for group form (including those with existing groups)
export const getAllMenteesForGroupForm = async (gender) => {
  return await axiosInstance.get(`/groups/mentees-for-form`, { params: { gender } });
};

// Get mentees for form with optional gender filter
export const getMenteesForForm = async (params = {}) => {
  return await axiosInstance.get('/groups/mentees-for-form', { params });
};

// Edit group specific APIs
export const getMentorsForEdit = async (groupId) => {
  return await axiosInstance.get(`/groups/${groupId}/edit-mentors`);
};

export const getMenteesForEdit = async (groupId) => {
  return await axiosInstance.get(`/groups/${groupId}/edit-mentees`);
};

// Trashed groups APIs
export const getTrashedGroups = async (params = {}) => {
  return await axiosInstance.get('/groups/trashed', { params });
};

export const restoreGroup = async (id) => {
  return await axiosInstance.post(`/groups/${id}/restore`);
};

export const forceDeleteGroup = async (id) => {
  return await axiosInstance.delete(`/groups/${id}/force`);
};

export default {
  getGroups,
  getGroup,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsStats,
  getGroupsStatistics,
  assignMentor,
  unassignMentor,
  addMenteesToGroup,
  removeMenteesFromGroup,
  moveMentees,
  getAvailableMentors,
  getAvailableMentees,
  getMentorGender,
  getGroupMentees,
  getAllMenteesForGroupForm,
  getMenteesForForm,
  getMentorsForEdit,
  getMenteesForEdit,
  getTrashedGroups,
  restoreGroup,
  forceDeleteGroup
};