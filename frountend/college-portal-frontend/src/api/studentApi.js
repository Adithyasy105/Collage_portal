import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';
const MARKS_API_URL = 'http://localhost:5000/api/marks';
const ATTENDANCE_API_URL = 'http://localhost:5000/api/attendance';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const getStudentDashboardData = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, getHeaders());
  return response.data;
};

export const getMyStudentProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`, getHeaders());
  return response.data;
};

export const upsertStudentProfileApi = async (profileData) => {
  const response = await axios.post(`${API_URL}/profile`, profileData, getHeaders());
  return response.data;
};

export const submitStudentFeedbackApi = async (feedbackData) => {
  const response = await axios.post(`${API_URL}/feedback`, feedbackData, getHeaders());
  return response.data;
};

export const submitBulkFeedbackApi = async (feedbacks) => {
  const response = await axios.post(`${API_URL}/feedback/bulk`, { feedbacks }, getHeaders());
  return response.data;
};

export const getTeachersForFeedbackApi = async (termId) => {
    const params = { termId };
    const response = await axios.get(`${API_URL}/feedback-teachers`, { ...getHeaders(), params });
    return response.data;
};


export const getStudentTermsApi = async () => {
    const response = await axios.get(`${API_URL}/terms`, getHeaders());
    return response.data;
};

export const uploadProfilePhotoApi = async (photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const response = await axios.post(`${API_URL}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

export const getStudentAttendanceApi = async (termId = null) => {
  const params = termId ? { termId } : {};
  const response = await axios.get(`${ATTENDANCE_API_URL}/my`, { ...getHeaders(), params });
  return response.data;
};

// CORRECTED: Added termId parameter to support historical marks viewing
export const getStudentMarksApi = async (subjectId = null, termId = null) => {
  const params = {};
  if (subjectId) params.subjectId = subjectId;
  if (termId) params.termId = termId;

  const response = await axios.get(`${MARKS_API_URL}/my`, { ...getHeaders(), params });
  return response.data;
};

// Get term-wise attendance summary
export const getStudentAttendanceSummaryApi = async (termId = null) => {
  const params = termId ? { termId } : {};
  const response = await axios.get(`${ATTENDANCE_API_URL}/summary`, { ...getHeaders(), params });
  return response.data;
};
