import axios from 'axios';

const API_URL = '/api/promotions';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getActivePromotions = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};
