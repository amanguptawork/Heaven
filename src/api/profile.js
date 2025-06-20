import axiosInstance from "./axios";

export const fetchUserProfile = async () => {
  const { data } = await axiosInstance.get("/auth/profile");

  return data.user;
};

export const getInterests = async () => {
  const { data } = await axiosInstance.get("/interests");
  return data;
};

export const getMaritalStatuses = async () => {
  const { data } = await axiosInstance.get("/marital-statuses/public");
  return data;
};

export const getDenominations = async () => {
  const { data } = await axiosInstance.get("/denominations");
  return data;
};

export const getOccupations = async () => {
  const { data } = await axiosInstance.get("/occupations");
  return data;
};

export const getUserProfile = async (userId) => {
  const { data } = await axiosInstance.get(`/profile/${userId}`);
  return data;
};

export const updateUserProfile = async (userId, profileData) => {
  const { data } = await axiosInstance.put(`/profile/${userId}`, profileData);
  return data;
};

export const updateProfile = async (updates) => {
  const { data } = await axiosInstance.put("/auth/profile", updates);
  return data;
};

export const logoutUser = async () => {
  const { data } = await axiosInstance.post("/auth/logout");
  return data;
};
