import axios from 'axios';

const API_URL = '/api/products';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getProducts = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(API_URL, productData, getHeaders());
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/${id}`, productData, getHeaders());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
