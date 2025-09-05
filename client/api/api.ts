import axios from "axios";
import "./interceptor"; // Import the interceptor to register it

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});
