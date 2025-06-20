import axiosInstance from './axios';

export const uploadImage = async (formData) => {
  const { data } = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};


export const uploadVideo = async (formData) => {
  const { data } = await axiosInstance.post("/upload/video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteVideo = async () => {
  const { data } = await axiosInstance.delete("/upload/video");
  return data;
};