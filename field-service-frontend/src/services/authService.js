import axiosInstance from "../api/axiosInstance";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);

  return response.data;
};

export const registerCustomer = async (customerData) => {
  const response = await axiosInstance.post(
    "/auth/register/customer",
    customerData,
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/auth/me");

  return response.data;
};
