import axios from "axios";

// API BASE URL pour les tests
export const apiBaseUrl = `http://localhost:${process.env.PORT}/api`;

// Axios requester
export const requester = axios.create({
  baseURL: apiBaseUrl,
  validateStatus: () => true
});
