import axiosInstance from "../api/axiosInstance";

export async function searchWorkOrders(filters = {}) {
  const params = {
    page: filters.page ?? 0,
    size: filters.size ?? 10,
    sortBy: filters.sortBy || "createdAt",
    sortDirection: filters.sortDirection || "desc",
  };

  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim();
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.priority) {
    params.priority = filters.priority;
  }

  if (filters.customerId) {
    params.customerId = filters.customerId;
  }

  if (filters.siteId) {
    params.siteId = filters.siteId;
  }

  if (filters.technicianId) {
    params.technicianId = filters.technicianId;
  }

  if (filters.createdFrom) {
    params.createdFrom = filters.createdFrom;
  }

  if (filters.createdTo) {
    params.createdTo = filters.createdTo;
  }

  const response = await axiosInstance.get("/work-orders/search", {
    params,
  });

  return response.data;
}

export async function getAllWorkOrders() {
  const response = await axiosInstance.get("/work-orders");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getWorkOrderById(workOrderId) {
  const response = await axiosInstance.get(`/work-orders/${workOrderId}`);

  return response.data;
}

export async function createWorkOrder(workOrderData) {
  const response = await axiosInstance.post("/work-orders", workOrderData);

  return response.data;
}

export async function assignTechnician(workOrderId, assignmentData) {
  const response = await axiosInstance.post(
    `/work-orders/${workOrderId}/assign`,
    assignmentData,
  );

  return response.data;
}

export async function transitionWorkOrderStatus(workOrderId, transitionData) {
  const response = await axiosInstance.post(
    `/work-orders/${workOrderId}/status`,
    transitionData,
  );

  return response.data;
}

export async function getWorkOrdersByStatus(status) {
  const response = await axiosInstance.get(`/work-orders/status/${status}`);

  return Array.isArray(response.data) ? response.data : [];
}

export async function getMyWorkOrders() {
  const response = await axiosInstance.get("/work-orders/my-jobs");

  return Array.isArray(response.data) ? response.data : [];
}
