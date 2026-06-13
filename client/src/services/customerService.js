import axios from 'axios';

const API_URL = '/api/customers';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getCustomers = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await axios.post(API_URL, customerData, getHeaders());
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`${API_URL}/${id}`, customerData, getHeaders());
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
