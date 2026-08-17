import axiosInstance from "../api/axiosInstance";

export async function getMyNotifications() {
  const response = await axiosInstance.get("/notifications");

  return response.data;
}

export async function getUnreadNotificationCount() {
  const response = await axiosInstance.get("/notifications/unread-count");

  return response.data;
}

export async function markNotificationAsRead(notificationId) {
  const response = await axiosInstance.patch(
    `/notifications/${notificationId}/read`,
  );

  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await axiosInstance.patch("/notifications/read-all");

  return response.data;
}
