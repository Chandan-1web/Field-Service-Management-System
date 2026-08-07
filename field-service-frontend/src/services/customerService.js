import axiosInstance from "../api/axiosInstance";

export async function getCustomers() {
  const response = await axiosInstance.get("/customers");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getCustomerById(customerId) {
  const response = await axiosInstance.get(`/customers/${customerId}`);

  return response.data;
}

export async function createCustomer(customerData) {
  const response = await axiosInstance.post("/customers", customerData);

  return response.data;
}

export async function updateCustomer(customerId, customerData) {
  const response = await axiosInstance.put(
    `/customers/${customerId}`,
    customerData,
  );

  return response.data;
}
