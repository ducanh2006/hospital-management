
import { UPLOAD_BASE_URL, API_BASE_URL } from '../constants/config';
import { Gender } from '../types';

export const getImageUrl = (filename: string | null | undefined, gender?: Gender) => {
  if (!filename) {
    if (gender === Gender.FEMALE) return `${UPLOAD_BASE_URL}/doctor-female-1.png`;
    return `${UPLOAD_BASE_URL}/doctor-male-1.png`;
  }
  return `${UPLOAD_BASE_URL}/${filename}`;
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

export const getGenderText = (gender: Gender) => {
  switch (gender) {
    case Gender.MALE: return 'Nam';
    case Gender.FEMALE: return 'Nữ';
    default: return 'Khác';
  }
};
