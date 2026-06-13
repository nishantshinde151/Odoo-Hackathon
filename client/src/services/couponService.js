import axios from 'axios';

const API_URL = '/api/coupons';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const validateCoupon = async (code, subtotal) => {
  const response = await axios.post(`${API_URL}/validate`, { code, subtotal }, getHeaders());
  return response.data;
};
