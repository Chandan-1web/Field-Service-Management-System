import axiosInstance from "../api/axiosInstance";

export async function getSites() {
  const response = await axiosInstance.get("/sites");

  return Array.isArray(response.data) ? response.data : [];
}

export async function createSite(customerId, siteData) {
  const response = await axiosInstance.post(
    `/customers/${customerId}/sites`,
    siteData,
  );

  return response.data;
}
