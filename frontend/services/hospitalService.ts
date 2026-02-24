import api from './api';
import { Doctor, Department, MedicalNews, Patient, Appointment, PageResponse } from '../types';
import { AppointmentHistoryDTO } from '../types';

export const profileService = {
  /** Lấy profile của người dùng hiện tại (dùng JWT). */
  getMe: () => api.get<ProfileDTO>('/profiles/me'),
  /** Cập nhật profile. */
  updateMe: (data: Partial<ProfileDTO>) => api.put<ProfileDTO>('/profiles', data),
};

export const patientService = {
  /** Lấy bản ghi patient của người dùng hiện tại. */
  getMe: () => api.get<Patient>('/patients/me'),
  /** Cập nhật bản ghi patient. */
  updateMe: (data: Partial<Patient>) => api.put<Patient>('/patients', data),

  getById: (id: string | number) => api.get<Patient>(`/patients/${id}`),
  create: (data: Partial<Patient>) => api.post('/patients', data),
  update: (id: string | number, data: Partial<Patient>) => api.put(`/patients/${id}`, data),
  delete: (id: string | number) => api.delete(`/patients/${id}`),
  /** Lấy lịch sử theo patient.id — vẫn giữ cho admin dùng */
  getAppointments: (id: string | number) => api.get<AppointmentHistoryDTO[]>(`/patients/appointments/${id}`),
  getAll: () => api.get<Patient[]>('/patients'),
};

export const doctorService = {
  /** Lấy bản ghi doctor của người dùng hiện tại. */
  getMe: () => api.get<Doctor>('/doctors/me'),
  /** Cập nhật bản ghi doctor. */
  updateMe: (data: Partial<Doctor>) => api.put<Doctor>('/doctors', data),

  getAll: () => api.get<Doctor[]>('/doctors'),
  getAllWithRating: () => api.get<Doctor[]>('/doctors/with-rating'),
  getById: (id: number | string) => api.get<Doctor>(`/doctors/${id}`),
  create: (data: Partial<Doctor>) => api.post('/doctors', data),
  update: (id: number, data: Partial<Doctor>) => api.put(`/doctors/${id}`, data),
  delete: (id: number) => api.delete(`/doctors/${id}`),

  /**
   * Tìm kiếm bác sĩ nâng cao — gọi GET /api/doctors/search
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
   * Đồng bộ tài khoản sau khi đăng nhập — gửi JWT tự động qua interceptor.
   * Backend upsert: account + profile + patient/doctor dựa trên role.
   */
  syncLogin: () => api.post('/accounts/login'),

  /** @deprecated Use profileService.getMe() */
  getMyProfile: () => api.get<ProfileDTO>('/accounts/me/profile'),

  /** @deprecated Use profileService.updateMe() */
  updateMyProfile: (data: Partial<ProfileDTO>) => api.put<ProfileDTO>('/accounts/me/profile', data),

  /**
   * Lịch sử khám bệnh của bệnh nhân đang đăng nhập.
   * Dùng cho TestResults và Booking — không cần nhập CCCD.
   */
  getMyAppointments: () => api.get<AppointmentHistoryDTO[]>('/accounts/me/appointments'),
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

// ─── Shared DTOs mirrored from backend ───────────────────────────────────────

/** Khớp với ProfileEntity trả về từ /accounts/me/profile */
export interface ProfileDTO {
  id?: number;
  accountId?: number;
  fullName?: string;
  identityNumber?: string;   // CCCD (12 số)
  gender?: string;           // 'MALE' | 'FEMALE' | 'OTHER'
  dateOfBirth?: string;      // 'YYYY-MM-DD'
  address?: string;
  phoneNumber?: string;
}
