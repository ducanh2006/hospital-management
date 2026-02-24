
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id?: number;
  username: string;
  role?: string;
}

/** Khớp với DoctorDTO của backend — các trường cá nhân lấy từ JOIN profile */
export interface Doctor {
  id: number;
  fullName: string;          // từ profile.full_name
  specialization: string;
  departmentId: number;
  departmentName?: string;
  gender: Gender;            // từ profile.gender
  dateOfBirth?: string;      // từ profile.date_of_birth
  experienceYear: number;
  phoneNumber?: string;      // từ profile.phone_number (đã đổi từ phone → phoneNumber)
  bio: string;
  pictureUrl?: string;       // từ picture.picture_url
  pictureId?: number;
  avgRating?: number;
  totalReviews?: number;
  // email và lastUpdate đã bị xóa khỏi backend schema mới
}

export interface Department {
  id: number;
  name: string;
  phone: string;
  headDoctorId: number;
  description: string;
  // lastUpdate đã bị xóa khỏi schema mới
}

/** Khớp với PatientDTO của backend — thông tin cá nhân lấy từ JOIN profile */
export interface Patient {
  id: number;                // patient.id (INT auto_increment, không còn là identityNumber)
  profileId?: number;
  fullName: string;          // từ profile.full_name
  identityNumber?: string;   // từ profile.identity_number (CCCD)
  gender: Gender;            // từ profile.gender
  dateOfBirth?: string;      // từ profile.date_of_birth
  phoneNumber?: string;      // từ profile.phone_number
  address?: string;          // từ profile.address
  insuranceNumber?: string;
  emergencyContactPhone?: string;
  // email, phone, lastUpdate đã bị xóa khỏi schema mới
}

/** Khớp với AppointmentEntity của backend */
export interface Appointment {
  id: number;
  patientId: number;         // patient.id (đã đổi từ patientIdentityNumber)
  doctorId: number;
  doctorName?: string;
  departmentId: number;
  departmentName?: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  testResults: string;
  rating?: number;
}

/** Khớp với AppointmentHistoryDTO của backend */
export interface AppointmentHistoryDTO {
  id: number;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  rating?: number;
  doctorName?: string;
  departmentName?: string;
  testResults?: string;
}

export interface MedicalNews {
  id: number;
  title: string;
  content: string;
  lastUpdate: string;
}

/** Khớp với PageResponse<T> của backend */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
