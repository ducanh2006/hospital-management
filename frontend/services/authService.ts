import api from './api';

/**
 * Đăng ký tài khoản mới (dùng trong Admin panel).
 * Lưu ý: Login không còn qua API nữa — login được xử lý bởi Keycloak.
 */
export const register = async (userData: { username: string; password: string }) => {
  const response = await api.post('/accounts', userData);
  return response.data;
};

export const updatePassword = async (userId: string | number, newPassword: string) => {
  const response = await api.put(`/accounts?id=${userId}`, newPassword, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return response.data;
};
