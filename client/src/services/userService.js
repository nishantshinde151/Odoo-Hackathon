import axios from 'axios';

const API_URL = '/api/users';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getUsers = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData, getHeaders());
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/${id}`, userData, getHeaders());
  return response.data;
};

export const changePassword = async (id, password) => {
  const response = await axios.put(`${API_URL}/${id}/password`, { password }, getHeaders());
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
