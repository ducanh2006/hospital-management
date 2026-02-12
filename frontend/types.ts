
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

export interface Doctor {
  id: number;
  fullName: string;
  specialization: string;
  departmentId: number;
  departmentName?: string;
  gender: Gender;
  experienceYear: number;
  phone: string;
  email: string;
  bio: string;
  pictureId?: number;
  photoUrl?: string;
  avgRating?: number;
  totalReviews?: number;
  lastUpdate: string;
}

export interface Department {
  id: number;
  name: string;
  phone: string;
  headDoctorId: number;
  description: string;
}

export interface Patient {
  identityNumber: number;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  phone: string;
  address: string;
  email: string;
  insuranceNumber: string;
  emergencyContactPhone: string;
  lastUpdate: string;
}

export interface Appointment {
  id: number;
  patientIdentityNumber: number;
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

export interface MedicalNews {
  id: number;
  title: string;
  content: string;
  lastUpdate: string;
}
