import axiosInstance from "../api/axios";

export const handleGoogleLogin = async (credentialResponse) => {
  try {
    const response = await axiosInstance.post(`/auth/google`, {
      credential: credentialResponse.credential,
    });

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      return {
        user: {
          email: response.data.user.email,
          fullName: response.data.user.fullName,
        },
        isNewUser: response.data.isNewUser,
      };
    }

    return response;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw new Error(error.response?.data?.message || "Google login failed");
  }
};
