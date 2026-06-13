import axios from 'axios';

const API_URL = '/api/auth';

export const login = async (email, password, role) => {
  const response = await axios.post(`${API_URL}/login`, { email, password, role });
  if (response.data.token) {
    localStorage.setItem('jwtToken', response.data.token);
  }
  return response.data;
};

export const signup = async (name, email, password, role) => {
  const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('jwtToken');
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('jwtToken');
  console.log(token);
  if (!token) return null;
  // Simple jwt parser mock
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

