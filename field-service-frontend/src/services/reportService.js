import axiosInstance from "../api/axiosInstance";

export async function getDashboardSummary() {
  const response = await axiosInstance.get("/dashboard/summary");

  return response.data;
}
