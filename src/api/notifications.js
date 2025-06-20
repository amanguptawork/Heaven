import axiosInstance from './axios';

export const fetchUnreadNotifications = async () => {
  const { data } = await axiosInstance.get("/notifications/unread");
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const { data } = await axiosInstance.patch(
    `/notifications/mark-read/${notificationId}`
  );
  return data;
};
