import axios from 'axios';

const API_URL = '/api/payments';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const processPayment = async (paymentData) => {
  const response = await axios.post(`${API_URL}/charge`, paymentData, getHeaders());
  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await axios.get(`${API_URL}/methods`, getHeaders());
  return response.data;
};
