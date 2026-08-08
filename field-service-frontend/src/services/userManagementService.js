import axiosInstance from "../api/axiosInstance";

// Get all Technician, Dispatcher and Customer accounts
export async function getManagedUsers() {
  const response = await axiosInstance.get("/users/manage");
  return response.data;
}

// Get one user by ID
export async function getManagedUserById(userId) {
  const response = await axiosInstance.get(`/users/manage/${userId}`);
  return response.data;
}

// Create a new user
export async function createManagedUser(userData) {
  const response = await axiosInstance.post("/users/manage", userData);
  return response.data;
}

// Update existing user
export async function updateManagedUser(userId, userData) {
  const response = await axiosInstance.put(`/users/manage/${userId}`, userData);

  return response.data;
}

// Activate user account
export async function activateManagedUser(userId) {
  const response = await axiosInstance.put(`/users/manage/${userId}/activate`);

  return response.data;
}

// Deactivate user account
export async function deactivateManagedUser(userId) {
  const response = await axiosInstance.put(
    `/users/manage/${userId}/deactivate`,
  );

  return response.data;
}

// Reset user's password
export async function resetManagedUserPassword(userId, temporaryPassword) {
  const response = await axiosInstance.put(
    `/users/manage/${userId}/reset-password`,
    {
      temporaryPassword,
    },
  );

  return response.data;
}
