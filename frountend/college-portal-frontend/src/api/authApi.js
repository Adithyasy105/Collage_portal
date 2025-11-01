import axios from 'axios';
import { API_URLS } from '../config/api.js';

const API_URL = API_URLS.AUTH;

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const loginApi = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPasswordApi = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password/${token}`, { newPassword });
  return response.data;
};

// --- NEW FUNCTION TO GET USER DETAILS ---
export const getMe = async () => {
  const response = await axios.get(`${API_URL}/me`, getHeaders());
  return response.data;
};