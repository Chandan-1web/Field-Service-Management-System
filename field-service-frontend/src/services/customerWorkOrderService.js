import axiosInstance from "../api/axiosInstance";

export async function createCustomerWorkOrder(requestData) {
  const response = await axiosInstance.post(
    "/work-orders/customer/request",
    requestData,
  );

  return response.data;
}

export async function getMyCustomerRequests() {
  const response = await axiosInstance.get("/work-orders/customer/my");

  return Array.isArray(response.data) ? response.data : [];
}
