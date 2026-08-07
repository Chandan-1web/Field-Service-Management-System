import axiosInstance from "../api/axiosInstance";

export async function getMyProfile() {
  const response = await axiosInstance.get("/users/me");

  return response.data;
}

export async function updateMyProfile(profileData) {
  const response = await axiosInstance.put("/users/me", profileData);

  return response.data;
}

export async function uploadMyProfilePhoto(imageFile) {
  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await axiosInstance.post(
    "/users/me/profile-photo",
    formData,
  );

  return response.data;
}

export async function removeMyProfilePhoto() {
  const response = await axiosInstance.delete("/users/me/profile-photo");

  return response.data;
}

export async function changeMyPassword(passwordData) {
  const response = await axiosInstance.put(
    "/users/change-password",
    passwordData,
  );

  return response.data;
}
