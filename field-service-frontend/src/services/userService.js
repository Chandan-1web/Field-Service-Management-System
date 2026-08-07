import axiosInstance from "../api/axiosInstance";

export async function getTechnicians() {
  const response = await axiosInstance.get("/users/technicians");

  return Array.isArray(response.data) ? response.data : [];
}
