import axiosInstance from './axiosInstance';

// Get current student's profile
export const getProfile = async () => {
  const response = await axiosInstance.get('/students/profile');
  return response.data;
};

// Update student's profile
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.patch('/students/profile', profileData);
  return response.data;
};
