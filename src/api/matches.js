import axiosInstance from "./axios";

export const getMatches = async (filters = {}) => {
  const { data } = await axiosInstance.get("/matches", { params: filters });
  return data;
};

export const handleSwipe = async ({ targetUserId, direction }) => {
  if (!targetUserId) throw new Error("Target user ID is required");
  const endpoint = direction === "right" ? "like" : "pass";
  const { data } = await axiosInstance.post(`/matches/${endpoint}`, {
    targetUserId,
  });
  return data;
};

export const getMatchHistory = async () => {
  const { data } = await axiosInstance.get("/matches/history");
  return data;
};

export const getLikedUsers = async () => {
  const { data } = await axiosInstance.get("/matches/liked-users");
  return data;
};

export const getWhoLikedMe = async () => {
  const { data } = await axiosInstance.get("/matches/who-liked-me");
  return data;
};

export const getUserPreferences = async () => {
  const { data } = await axiosInstance.get("/matches/preferences");
  return data;
};

export const updateUserPreferences = async (preferences) => {
  const { data } = await axiosInstance.put("/matches/preferences", preferences);
  return data;
};

export const updatePreferencesSeen = async (id) => {
  const { data } = await axiosInstance.patch(`/personality/matches/${id}`, {});
  return data;
};

export const getMutualMatches = async () => {
  const { data } = await axiosInstance.get("/matches/mutual");
  return data;
};

export const getPersonalityMatches = async () => {
  const { data } = await axiosInstance.get("/personality/matches");
  return {
    matches: data.matches || [],
    pagination: data.pagination,
    count: data.unseenCount,
  };
};

export const updatePersonalityScores = async (personalityData) => {
  const { data } = await axiosInstance.put(
    "/api/users/personality-scores",
    personalityData
  );
  return data;
};

export const markLikeAsSeen = async (likeId) => {
  const { data } = await axiosInstance.patch("/matches/likes/mark-as-seen", {
    likeId,
  });
  return data;
};
