import axios from "axios";

const API_URL = "http://localhost:3000/api/vi";

export const fetchCustomerReturns = async () => {
  const response = await axios.get(`${API_URL}/customer-returns`);
  return response.data;
};
export const updateCustomerReturn = async (id, status) => {
  const response = await axios.put(`${API_URL}/customer-returns/${id}`, {
    status,
  });
  return response.data;
};

export const fetchMerchantData = async (id) => {
  const response = await axios.get(`${API_URL}/merchants/${id}`);
  return response.data;
};
