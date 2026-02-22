import api from './api';
import { Doctor, Department, MedicalNews, Patient, Appointment, PageResponse } from '../types';

export const doctorService = {
  getAll: () => api.get<Doctor[]>('/doctors'),
  getAllWithRating: () => api.get<Doctor[]>('/doctors/with-rating'),
  getById: (id: number | string) => api.get<Doctor>(`/doctors/${id}`),
  create: (data: Partial<Doctor>) => api.post('/doctors', data),
  update: (id: number, data: Partial<Doctor>) => api.put(`/doctors/${id}`, data),
  delete: (id: number) => api.delete(`/doctors/${id}`),

  /**
   * Tìm kiếm bác sĩ nâng cao — gọi GET /api/doctors/search
   * Phân trang do backend xử lý (Deferred Join), trả về PageResponse<Doctor>.
   */
  search: (params: {
    name?: string;
    gender?: string;
    departmentId?: number | string;
    page?: number;
    size?: number;
  }) => api.get<PageResponse<Doctor>>('/doctors/search', { params }),
};

export const accountService = {
  /**
   * Đồng bộ tài khoản với backend sau khi đăng nhập Keycloak.
   * Chỉ cần gửi Authorization: Bearer <token> trong header.
   * Header này được tự động đính kèm bởi api interceptor (api.ts).
   * Backend sẽ đọc JWT từ header, tự parse sub/email/roles và upsert vào DB.
   */
  syncLogin: () => api.post('/accounts/login'),
};

export const departmentService = {
  getAll: () => api.get<Department[]>('/departments'),
  getById: (id: number) => api.get<Department>(`/departments/${id}`),
  create: (data: Partial<Department>) => api.post('/departments', data),
  update: (id: number, data: Partial<Department>) => api.put(`/departments/${id}`, data),
  delete: (id: number) => api.delete(`/departments/${id}`),
};

export const newsService = {
  getAll: () => api.get<MedicalNews[]>('/medical-news'),
  getById: (id: number) => api.get<MedicalNews>(`/medical-news/${id}`),
  create: (data: Partial<MedicalNews>) => api.post('/medical-news', data),
  update: (id: number, data: Partial<MedicalNews>) => api.put(`/medical-news/${id}`, data),
  delete: (id: number) => api.delete(`/medical-news/${id}`),
};

export const patientService = {
  getById: (cccd: string | number) => api.get<Patient>(`/patients/${cccd}`),
  create: (data: Partial<Patient>) => api.post('/patients', data),
  update: (cccd: string | number, data: Partial<Patient>) => api.put(`/patients/${cccd}`, data),
  delete: (cccd: string | number) => api.delete(`/patients/${cccd}`),
  getAppointments: (cccd: string | number) => api.get<Appointment[]>(`/patients/appointments/${cccd}`),
  getAll: () => api.get<Patient[]>('/patients'),
};

export const appointmentService = {
  create: (data: any) => api.post('/appointments', data),
  getAll: () => api.get<Appointment[]>('/appointments'),
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
};

export const pictureService = {
  getById: (id: number) => api.get(`/pictures/find-by-id?id=${id}`),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pictures/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
