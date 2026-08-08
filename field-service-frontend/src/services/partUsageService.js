import axiosInstance from "../api/axiosInstance";

export async function getMyPartUsage() {
  const response = await axiosInstance.get("/part-usage/my");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getWorkOrderPartUsage(workOrderId) {
  const response = await axiosInstance.get(`/work-orders/${workOrderId}/parts`);

  return Array.isArray(response.data) ? response.data : [];
}

export async function usePartForWorkOrder(workOrderId, partUsageData) {
  const response = await axiosInstance.post(
    `/work-orders/${workOrderId}/parts`,
    partUsageData,
  );

  return response.data;
}
