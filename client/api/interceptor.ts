import axios from "axios";
import { api } from "./api";
import { ErrorResponse } from "./type";

// Response interceptor to handle API errors consistently
api.interceptors.response.use(
  (response) => {
    // If the response is successful, return it as is
    return response;
  },
  (error) => {
    if (error.response?.data && axios.isAxiosError(error)) {
      return Promise.reject(new Error(error.response.data.error.message));
    } else {
      // Create a standardized error response from the axios error
      const newError: ErrorResponse = {
        success: false,
        error: error,
      };
      return Promise.reject(new Error(newError.error.message));
    }
  }
);

export default api;
