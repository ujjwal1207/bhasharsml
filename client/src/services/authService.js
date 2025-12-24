import axios from 'axios';

const API_URL = '/api/auth';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set auth header
const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get all users (admin only)
export const getUsers = async (status = '') => {
  const url = status ? `${API_URL}/users?status=${status}` : `${API_URL}/users`;
  const response = await axios.get(url, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Approve user (admin only)
export const approveUser = async (userId) => {
  const response = await axios.put(
    `${API_URL}/users/${userId}/approve`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Reject user (admin only)
export const rejectUser = async (userId) => {
  const response = await axios.put(
    `${API_URL}/users/${userId}/reject`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Initialize admin (only works if no users exist)
export const initAdmin = async (userData) => {
  const response = await axios.post(`${API_URL}/init-admin`, userData);
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getUsers,
  approveUser,
  rejectUser,
  deleteUser,
  initAdmin,
  getToken
};
