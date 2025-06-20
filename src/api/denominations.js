import axiosInstance from "./axios";

export const getDenominations = async () => {
  const { data } = await axiosInstance.get("/denominations");
  return data;
};
