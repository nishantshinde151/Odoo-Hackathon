import axios from 'axios';

const API_URL = '/api/sessions';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getSessions = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const getActiveSession = async () => {
  const response = await axios.get(`${API_URL}/active`, getHeaders());
  return response.data;
};

export const openSession = async (openingBalance) => {
  const response = await axios.post(`${API_URL}/open`, { openingBalance }, getHeaders());
  return response.data;
};

export const closeSession = async (closingAmount) => {
  const response = await axios.post(`${API_URL}/close`, { closingAmount }, getHeaders());
  return response.data;
};

export const getSessionSummary = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/summary`, getHeaders());
  return response.data;
};
