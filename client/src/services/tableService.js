import axios from 'axios';

const API_URL = '/api/tables';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getTables = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createTable = async (tableData) => {
  const response = await axios.post(API_URL, tableData, getHeaders());
  return response.data;
};

export const updateTable = async (id, tableData) => {
  const response = await axios.put(`${API_URL}/${id}`, tableData, getHeaders());
  return response.data;
};

export const deleteTable = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
