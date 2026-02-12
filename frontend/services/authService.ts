
import api from './api';

export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/accounts', userData);
  return response.data;
};

export const updatePassword = async (userId: string, newPassword: string) => {
  const response = await api.put(`/accounts?id=${userId}`, newPassword, {
    headers: { 'Content-Type': 'text/plain' }
  });
  return response.data;
};
