import axiosInstance from "../api/axiosInstance";

export async function getAllParts() {
  const response = await axiosInstance.get("/parts");

  return Array.isArray(response.data) ? response.data : [];
}

export async function getPartById(partId) {
  const response = await axiosInstance.get(`/parts/${partId}`);

  return response.data;
}

export async function createPart(partData) {
  const response = await axiosInstance.post("/parts", partData);

  return response.data;
}

export async function updatePart(partId, partData) {
  const response = await axiosInstance.put(`/parts/${partId}`, {
    name: partData.name,
    sku: partData.sku,
    unitCost: Number(partData.unitCost),
    stockQty: Number(partData.stockQty),
  });

  return response.data;
}
