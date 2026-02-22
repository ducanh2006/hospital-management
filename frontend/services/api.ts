import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import keycloak from './keycloakService';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor: đính kèm Keycloak access token vào mọi request
api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated && keycloak.token) {
    // Refresh token nếu sắp hết hạn (trong vòng 30 giây)
    try {
      await keycloak.updateToken(30);
    } catch {
      keycloak.login();
      return Promise.reject(new Error('Token refresh failed, redirecting to login'));
    }
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

// Response interceptor: xử lý 401 / 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ → redirect đến Keycloak login
      keycloak.login();
    }
    return Promise.reject(error);
  }
);

export default api;
