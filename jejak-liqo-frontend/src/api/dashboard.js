import axiosInstance from './axiosInstance';

export const dashboardAPI = {
  // Get dashboard statistics with comparison
  getStatsComparison: async () => {
    const response = await axiosInstance.get('/dashboard/stats-comparison');
    return response.data;
  },

  // Get yearly trend data
  getYearlyTrend: async () => {
    const response = await axiosInstance.get('/dashboard/yearly-trend');
    return response.data;
  },

  // Get meeting statistics
  getMeetingStats: async () => {
    const response = await axiosInstance.get('/meetings/statistics');
    return response.data;
  },

  // Get attendance statistics
  getAttendanceStats: async () => {
    const response = await axiosInstance.get('/dashboard/attendance-stats');
    return response.data;
  },

  // Get weekly trend data
  getWeeklyTrend: async () => {
    const response = await axiosInstance.get('/dashboard/weekly-trend');
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await axiosInstance.get('/dashboard/upcoming-events');
    return response.data;
  }
};