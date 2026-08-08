import axiosInstance from "../api/axiosInstance";

export async function getMyPerformance() {
  const response = await axiosInstance.get(
    "/reports/technicians/me/performance",
  );

  return response.data;
}
