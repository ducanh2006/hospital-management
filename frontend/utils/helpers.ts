
import { UPLOAD_BASE_URL, API_BASE_URL } from '../constants/config';
import { Gender } from '../types';

export const getImageUrl = (filename: string | null | undefined, gender?: Gender, size?: number) => {
  let url = "";

  // 1. Xác định URL cơ bản
  if (!filename) {
    url = gender === Gender.FEMALE
      ? `${UPLOAD_BASE_URL}/doctor-female-1.png`
      : `${UPLOAD_BASE_URL}/doctor-male-1.png`;
  } else {
    url = `${UPLOAD_BASE_URL}/${filename}`;
  }

  // 2. Thêm tham số size nếu có truyền vào
  if (size) {
    url += `?size=${size}`;
  }

  return url;
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
