import axiosInstance from "../api/axiosInstance";

export async function getMyTimeLogs() {
  const response = await axiosInstance.get("/time-logs/my");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getMyTotalMinutes() {
  const response = await axiosInstance.get("/time-logs/my/total-minutes");

  return Number(response.data || 0);
}

export async function logTimeForWorkOrder(workOrderId, timeLogData) {
  const response = await axiosInstance.post(
    `/work-orders/${workOrderId}/time-logs`,
    timeLogData,
  );

  return response.data;
}

export async function getWorkOrderTimeLogs(workOrderId) {
  const response = await axiosInstance.get(
    `/work-orders/${workOrderId}/time-logs`,
  );

  return Array.isArray(response.data) ? response.data : [];
}
