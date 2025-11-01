import axios from "axios";
import { API_URLS } from '../config/api.js';

const ADMIN_API_URL = API_URLS.ADMIN;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// -------------------- USERS --------------------
export const uploadUsersCsvApi = async (csvFile) => {
  const formData = new FormData();
  formData.append("file", csvFile);

  const res = await axios.post(`${ADMIN_API_URL}/upload-users`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

export const createUserApi = async (userData) =>
  (await axios.post(`${ADMIN_API_URL}/users`, userData, getHeaders())).data;

export const getUsersApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/users`, getHeaders())).data;

export const updateUserApi = async (id, userData) =>
  (await axios.put(`${ADMIN_API_URL}/users/${id}`, userData, getHeaders())).data;

export const deleteUserApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/users/${id}`, getHeaders())).data;

// -------------------- HOLIDAYS --------------------
export const createHolidayApi = async (holiday) =>
  (await axios.post(`${ADMIN_API_URL}/holidays`, holiday, getHeaders())).data;

export const getHolidaysApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/holidays`, getHeaders())).data;

export const updateHolidayApi = async (id, holiday) =>
  (await axios.put(`${ADMIN_API_URL}/holidays/${id}`, holiday, getHeaders())).data;

export const deleteHolidayApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/holidays/${id}`, getHeaders())).data;

export const uploadHolidaysCsvApi = async (csvFile) => {
  const formData = new FormData();
  formData.append("file", csvFile);

  const res = await axios.post(`${ADMIN_API_URL}/holidays/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

// -------------------- MASTER DATA --------------------
export const createDepartmentApi = async (dep) =>
  (await axios.post(`${ADMIN_API_URL}/departments`, dep, getHeaders())).data;

export const getDepartmentsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/departments`, getHeaders())).data;

export const updateDepartmentApi = async (id, dep) =>
  (await axios.put(`${ADMIN_API_URL}/departments/${id}`, dep, getHeaders())).data;

export const deleteDepartmentApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/departments/${id}`, getHeaders())).data;

export const createProgramApi = async (prog) =>
  (await axios.post(`${ADMIN_API_URL}/programs`, prog, getHeaders())).data;

export const getProgramsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/programs`, getHeaders())).data;

export const updateProgramApi = async (id, prog) =>
  (await axios.put(`${ADMIN_API_URL}/programs/${id}`, prog, getHeaders())).data;

export const deleteProgramApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/programs/${id}`, getHeaders())).data;

export const createSectionApi = async (sec) =>
  (await axios.post(`${ADMIN_API_URL}/sections`, sec, getHeaders())).data;

export const getSectionsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/sections`, getHeaders())).data;

export const updateSectionApi = async (id, sec) =>
  (await axios.put(`${ADMIN_API_URL}/sections/${id}`, sec, getHeaders())).data;

export const deleteSectionApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/sections/${id}`, getHeaders())).data;

export const createTermApi = async (term) =>
  (await axios.post(`${ADMIN_API_URL}/terms`, term, getHeaders())).data;

export const getTermsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/terms`, getHeaders())).data;

export const updateTermApi = async (id, term) =>
  (await axios.put(`${ADMIN_API_URL}/terms/${id}`, term, getHeaders())).data;

export const deleteTermApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/terms/${id}`, getHeaders())).data;

export const createSubjectApi = async (subj) =>
  (await axios.post(`${ADMIN_API_URL}/subjects`, subj, getHeaders())).data;

export const getSubjectsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/subjects`, getHeaders())).data;

export const updateSubjectApi = async (id, subj) =>
  (await axios.put(`${ADMIN_API_URL}/subjects/${id}`, subj, getHeaders())).data;

export const deleteSubjectApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/subjects/${id}`, getHeaders())).data;

// -------------------- AUDIT & FEEDBACK --------------------
export const getAuditLogsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/audit-logs`, getHeaders())).data;

export const getIncompleteStudentsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/students/incomplete`, getHeaders())).data;

export const getIncompleteStaffApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/staff/incomplete`, getHeaders())).data;

export const getAllStaff = async () =>
  (await axios.get(`${ADMIN_API_URL}/staff`, getHeaders())).data;

export const getFeedbackApi = async (params = {}) =>
  (await axios.get(`${ADMIN_API_URL}/feedback`, { ...getHeaders(), params })).data;

// -------------------- STAFF ASSIGNMENTS --------------------
export const getStaffAssignmentsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/staff-assignments`, getHeaders())).data;

export const createStaffAssignmentApi = async (assignmentData) =>
  (await axios.post(`${ADMIN_API_URL}/staff-assignments`, assignmentData, getHeaders())).data;

export const updateStaffAssignmentApi = async (id, assignmentData) =>
  (await axios.put(`${ADMIN_API_URL}/staff-assignments/${id}`, assignmentData, getHeaders())).data;

export const deleteStaffAssignmentApi = async (id) =>
  (await axios.delete(`${ADMIN_API_URL}/staff-assignments/${id}`, getHeaders())).data;

export const fixStaffAssignmentSequenceApi = async () =>
  (await axios.post(`${ADMIN_API_URL}/staff-assignments/fix-sequence`, {}, getHeaders())).data;

export const exportFeedbackCsvApi = async (params = {}) =>
  (await axios.get(`${ADMIN_API_URL}/feedback/export`, {
    ...getHeaders(),
    params,
    responseType: "blob",
  })).data;

export const getTeacherAverageRatingsApi = async () =>
  (await axios.get(`${ADMIN_API_URL}/feedback/analytics/teacher-averages`, getHeaders())).data;

// -------------------- RESULTS --------------------
export const generateResultsApi = async (termId) =>
  (await axios.post(`${ADMIN_API_URL}/generate-results`, { termId }, getHeaders())).data;