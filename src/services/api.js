import axios from "axios";

const API_URL = "http://localhost:3001/api/v1";

export const fetchCustomerReturns = async () => {
  const response = await axios.get(`${API_URL}/customer_returns`);
  return response.data;
};

export const updateCustomerReturn = async (id, status) => {
  const response = await axios.put(`${API_URL}/customer_returns/${id}`, {
    status,
  });
  return response.data;
};

export const fetchMerchantData = async () => {
  const response = await axios.get(`${API_URL}/merchants`);
  return response.data;
};

export const initiateRefund = async (id) => {
  const response = await axios.post(`${API_URL}/customer_returns/${id}/refund`);
  return response.data;
};

const api = {
  fetchCustomerReturns,
  updateCustomerReturn,
  fetchMerchantData,
  initiateRefund,
};

export default api;
