import axios from 'axios';

const API_URL = '/api/floors';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
});

export const getFloors = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createFloor = async (floorData) => {
  const response = await axios.post(API_URL, floorData, getHeaders());
  return response.data;
};

export const updateFloor = async (id, floorData) => {
  const response = await axios.put(`${API_URL}/${id}`, floorData, getHeaders());
  return response.data;
};

export const deleteFloor = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};
