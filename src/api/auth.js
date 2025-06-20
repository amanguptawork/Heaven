import axiosInstance from "./axios";

const AUTH_BASE = "/auth";

export const checkEmail = async (payload) => {
  const { data } = await axiosInstance.post(
    `${AUTH_BASE}/check-email`,
    payload
  );
  return data;
};

export const register = async (payload) => {
  const { data } = await axiosInstance.post(`${AUTH_BASE}/register`, payload);
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
};

export const sendVerificationEmail = async (payload) => {
  const { data } = await axiosInstance.post(
    `${AUTH_BASE}/send-verification`,
    payload
  );
  return data;
};

export const verifyOTP = async (otp) => {
  const email = localStorage.getItem("verificationEmail");
  if (!email) throw new Error("No verification email in storage");
  const { data } = await axiosInstance.post(`${AUTH_BASE}/verify-otp`, {
    otp,
    email,
    isLogin: true,
  });
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
};

export const checkAuthStatus = async () => {
  try {
    const { data } = await axiosInstance.get(`${AUTH_BASE}/profile`);
    return data;
  } catch (err) {
    localStorage.removeItem("authToken");
    throw err;
  }
};

export const login = async (credentials) => {
  const { data } = await axiosInstance.post(`${AUTH_BASE}/login`, credentials);
  // stash the email so verifyOTP can pick it up
  localStorage.setItem("verificationEmail", credentials.email);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post(`${AUTH_BASE}/forgot-password`, {
    email,
  });
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await axiosInstance.post(
    `${AUTH_BASE}/reset-password`,
    payload
  );
  return data;
};
