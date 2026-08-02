import axiosInstance from "../api/axiosInstance";

async function getTechnicianPerformance() {
  const techniciansResponse = await axiosInstance.get("/users/technicians");

  const technicians = Array.isArray(techniciansResponse.data)
    ? techniciansResponse.data
    : [];

  if (technicians.length === 0) {
    return [];
  }

  const performanceResponses = await Promise.all(
    technicians.map((technician) =>
      axiosInstance.get(`/reports/technicians/${technician.id}/performance`),
    ),
  );

  return performanceResponses.map((response) => response.data);
}

export async function getDashboardData() {
  const [
    summaryResponse,
    overdueResponse,
    recentWorkOrdersResponse,
    technicianPerformance,
  ] = await Promise.all([
    axiosInstance.get("/dashboard/summary"),

    axiosInstance.get("/reports/work-orders/overdue"),

    axiosInstance.get(
      "/work-orders/search?page=0&size=5&sortBy=createdAt&sortDirection=desc",
    ),

    getTechnicianPerformance(),
  ]);

  return {
    summary: summaryResponse.data,

    overdueWorkOrders: Array.isArray(overdueResponse.data)
      ? overdueResponse.data
      : [],

    recentWorkOrders: recentWorkOrdersResponse.data?.content || [],

    technicianPerformance: Array.isArray(technicianPerformance)
      ? technicianPerformance
      : [],
  };
}
