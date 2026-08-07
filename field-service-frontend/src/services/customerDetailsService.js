import axiosInstance from "../api/axiosInstance";

export async function getCustomerDetails(customerId) {
  const [customerResponse, sitesResponse, workOrdersResponse] =
    await Promise.all([
      axiosInstance.get(`/customers/${customerId}`),

      axiosInstance.get(`/customers/${customerId}/sites`),

      axiosInstance.get(
        `/work-orders/search?customerId=${customerId}&page=0&size=10&sortBy=createdAt&sortDirection=desc`,
      ),
    ]);

  return {
    customer: customerResponse.data,

    sites: Array.isArray(sitesResponse.data) ? sitesResponse.data : [],

    workOrders: workOrdersResponse.data?.content || [],
  };
}
