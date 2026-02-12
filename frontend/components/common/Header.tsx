
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_ROUTES, UPLOAD_BASE_URL } from '../../constants/config';

const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: APP_ROUTES.HOME, label: 'Trang chủ' },
    { path: APP_ROUTES.ABOUT, label: 'Giới thiệu' },
    { path: APP_ROUTES.ORG, label: 'Cơ cấu tổ chức' },
    { path: APP_ROUTES.BOOKING, label: 'Đặt lịch khám' },
    { path: APP_ROUTES.DOCTORS, label: 'Đội ngũ bác sĩ' },
    { path: APP_ROUTES.NEWS, label: 'Tin tức' },
    { path: APP_ROUTES.RESULTS, label: 'Kết quả xét nghiệm' },
    { path: APP_ROUTES.LOGIN, label: 'Quản lý hệ thống' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={`${UPLOAD_BASE_URL}/logo.png`} 
            alt="Sunshine Logo" 
            className="w-12 h-12 rounded-xl border-2 border-blue-50 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 leading-none">Bệnh viện Ánh Dương</span>
            <span className="text-sm font-medium text-[#0093E9]">Chăm sóc bằng cả trái tim</span>
          </div>
        </Link>
      </div>

      <nav className="bg-gradient-to-r from-[#0093E9] to-[#007bbd] text-white overflow-x-auto">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center whitespace-nowrap">
            {navItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`block px-5 py-4 font-medium transition-colors hover:bg-white/10 ${
                    isActive(item.path) ? 'bg-white/20' : ''
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
