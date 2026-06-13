import axios from 'axios';

const API_URL = '/api/orders';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getOrders = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await axios.post(API_URL, orderData, getHeaders());
  return response.data;
};

export const updateOrder = async (id, orderData) => {
  const response = await axios.put(`${API_URL}/${id}`, orderData, getHeaders());
  return response.data;
};
