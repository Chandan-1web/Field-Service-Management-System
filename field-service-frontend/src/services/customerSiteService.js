import axiosInstance from "../api/axiosInstance";

export async function getMyCustomerSites() {
  const response = await axiosInstance.get("/customer/sites");

  return Array.isArray(response.data) ? response.data : [];
}

export async function createMyCustomerSite(siteData) {
  const response = await axiosInstance.post("/customer/sites", siteData);

  return response.data;
}
