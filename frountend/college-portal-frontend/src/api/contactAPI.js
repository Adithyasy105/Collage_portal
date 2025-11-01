import axios from "axios";
import { API_URLS } from '../config/api.js';

const API_URL = API_URLS.CONTACTS;

// Attach token for protected routes
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ------------------ PUBLIC ------------------ */

// Create a new contact (public)
export const createContactApi = async (formData) => {
  const response = await axios.post(API_URL, formData);
  return response.data;
};

/* ------------------ ADMIN (staff role only) ------------------ */

// Get all contacts (admin/staff)
export const getContactsApi = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

// Update contact status
export const updateContactStatusApi = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/${id}`,
    { status },
    getHeaders()
  );
  return response.data;
};

// Delete a contact
export const deleteContactApi = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
