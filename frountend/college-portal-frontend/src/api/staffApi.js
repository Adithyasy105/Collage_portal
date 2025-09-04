import axios from 'axios';

const API_URL = 'http://localhost:5000/api/staff';
const MARKS_API_URL = 'http://localhost:5000/api/marks';
const ATTENDANCE_API_URL = 'http://localhost:5000/api/attendance';
/*const ADMIN_API_URL = 'http://localhost:5000/api/students';*/

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const getStaffDashboardData = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, getHeaders());
  return response.data;
};

export const getMyStaffProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`, getHeaders());
  return response.data;
};

export const upsertStaffProfileApi = async (profileData) => {
  const response = await axios.post(`${API_URL}/profile`, profileData, getHeaders());
  return response.data;
};

export const uploadStaffProfilePhotoApi = async (photoFile) => {
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

export const getStaffFeedbackApi = async () => {
    const response = await axios.get(`${API_URL}/my-feedback`, getHeaders());
    return response.data;
};

/* -------------------- MARKS -------------------- */

// Create an assessment
export const createAssessment = async (assessmentData) => {
  const response = await axios.post(
    `${MARKS_API_URL}/assessment`,
    assessmentData,
    getHeaders()
  );
  return response.data;
};

// Fetch staff assigned sections/subjects/terms
export const getStaffAssignments = async () => {
  const response = await axios.get(`${MARKS_API_URL}/assignments`, getHeaders());
  return response.data;
};


// Upload marks manually (JSON)
export const uploadMarksApi = async (marksData) => {
  const response = await axios.post(
    `${MARKS_API_URL}/upload`,
    marksData,
    getHeaders()
  );
  return response.data;
};

// Upload marks via CSV
export const uploadMarksCsvApi = async (csvFile, assessmentId) => {
  const formData = new FormData();
  formData.append("file", csvFile);
  formData.append("assessmentId", assessmentId);

  const response = await axios.post(`${MARKS_API_URL}/upload-csv`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

// Get staff-created assessments
export const getMyAssessments = async () => {
  const response = await axios.get(`${MARKS_API_URL}/my-assessments`, getHeaders());
  return response.data;
};

// Get students + marks for a specific assessment
export const getAssessmentMarks = async (assessmentId) => {
  const response = await axios.get(
    `${MARKS_API_URL}/${assessmentId}/marks`,
    getHeaders()
  );
  return response.data;
};

// Student gets their marks
export const getStudentMarksApi = async (subjectId = null, termId = null) => {
  const params = {};
  if (subjectId) params.subjectId = subjectId;
  if (termId) params.termId = termId;

  const response = await axios.get(`${MARKS_API_URL}/my`, {
    ...getHeaders(),
    params,
  });
  return response.data;
};
/* -------------------- ATTENDANCE -------------------- */

// CORRECTED: The API call now goes to the attendance API endpoint
/*export const getSectionStudentsApi = async (sectionId) => {
    const params = { sectionId };
    const response = await axios.get(`${ATTENDANCE_API_URL}/students`, { ...getHeaders(), params });
    return response.data;
};*/

// api/attendanceAPI.js
/*export const getMySessionsApi = async () => {
  const response = await axios.get(`${ATTENDANCE_API_URL}/my-sessions`, getHeaders());
    return response.data;
};


export const getSectionStudentsApi = async (sectionId) => {
  const params = { sectionId };
  const response = await axios.get(`${ATTENDANCE_API_URL}/students`, {
    ...getHeaders(),
    params,
  });
  return response.data;
};

export const uploadAttendanceCsvApi = async (csvFile, sessionId) => {
  const formData = new FormData();
  formData.append("file", csvFile);      // key must match multer field name
  formData.append("sessionId", sessionId);
  const response = await axios.post(`${ATTENDANCE_API_URL}/upload-csv`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    return response.data;
};

export const createClassSessionApi = async (sessionData) => {
    const response = await axios.post(`${ATTENDANCE_API_URL}/session`, sessionData, getHeaders());
    return response.data;
};

export const markAttendanceApi = async (attendanceData) => {
    const response = await axios.post(`${ATTENDANCE_API_URL}/mark`, attendanceData, getHeaders());
    return response.data;
};*/
export const getMySessionsApi = async () => {
  const response = await axios.get(`${ATTENDANCE_API_URL}/my-sessions`, getHeaders());
  return response.data;
};

export const getSectionStudentsApi = async (sectionId) => {
  const response = await axios.get(`${ATTENDANCE_API_URL}/students`, {
    headers: getHeaders().headers,
    params: { sectionId }
  });
  return response.data;
};


export const createClassSessionApi = async (sessionData) => {
  const response = await axios.post(`${ATTENDANCE_API_URL}/session`, sessionData, getHeaders());
  return response.data;
};

export const markAttendanceApi = async (attendanceData) => {
  const response = await axios.post(`${ATTENDANCE_API_URL}/mark`, attendanceData, getHeaders());
  return response.data;
};

export const uploadAttendanceCsvApi = async (csvFile, sessionId) => {
  const formData = new FormData();
  formData.append("file", csvFile);
  formData.append("sessionId", sessionId);
  const response = await axios.post(`${ATTENDANCE_API_URL}/upload-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

