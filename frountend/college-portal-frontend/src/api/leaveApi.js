import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leave';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

/**
 * Get all staff/teachers for student to select from
 */
export const getStaffForLeaveApi = async () => {
  const response = await axios.get(`${API_URL}/staff`, getHeaders());
  return response.data;
};

/**
 * Submit leave application (student)
 * @param {Object} formData - { staffId, startDate, endDate, reason, letter (File) }
 */
export const submitLeaveApplicationApi = async (formData) => {
  const headers = {
    ...getHeaders().headers,
    'Content-Type': 'multipart/form-data',
  };
  const response = await axios.post(`${API_URL}/submit`, formData, { headers });
  return response.data;
};

/**
 * Get student's leave applications
 */
export const getStudentLeaveApplicationsApi = async () => {
  const response = await axios.get(`${API_URL}/my-applications`, getHeaders());
  return response.data;
};

/**
 * Get leave applications for staff (all applications sent to this staff member)
 */
export const getStaffLeaveApplicationsApi = async () => {
  const response = await axios.get(`${API_URL}/applications`, getHeaders());
  return response.data;
};

/**
 * Update leave application status (staff)
 * @param {number} applicationId 
 * @param {string} action - 'APPROVED' | 'REJECTED'
 * @param {string} comments - Optional staff comments
 */
export const updateLeaveApplicationStatusApi = async (applicationId, action, comments = '') => {
  const response = await axios.put(
    `${API_URL}/${applicationId}/status`,
    { action, comments },
    getHeaders()
  );
  return response.data;
};
