// API Configuration
// This file centralizes API URL configuration for production and development

// Get API URL from environment variable or default to localhost
const getApiUrl = () => {
  // Check for production API URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();

// Individual API endpoints
export const API_URLS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  STUDENTS: `${API_BASE_URL}/api/students`,
  STAFF: `${API_BASE_URL}/api/staff`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  MARKS: `${API_BASE_URL}/api/marks`,
  ADMISSIONS: `${API_BASE_URL}/api/admissions`,
  CONTACTS: `${API_BASE_URL}/api/contacts`,
  LEAVE: `${API_BASE_URL}/api/leave`,
};

export default API_BASE_URL;

