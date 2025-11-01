import axios from "axios";
import { API_URLS } from '../config/api.js';

const API_URL = API_URLS.ADMISSIONS;

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ------------------ PUBLIC ------------------ */

// Submit admission form (public)
export const createAdmissionApi = async (formData) => {
  const response = await axios.post(API_URL, formData);
  return response.data;
};

/* ------------------ ADMIN (staff role only) ------------------ */

// Get all admissions
export const getAdmissionsApi = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

// Update admission status
export const updateAdmissionStatusApi = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/${id}`,
    { status },
    getHeaders()
  );
  return response.data;
};

// Delete admission
export const deleteAdmissionApi = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
