
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES, UPLOAD_BASE_URL } from '../../constants/config';

const Footer: React.FC = () => {
  return (
    <>
      <div className="bg-[#0093E9] text-white py-3 text-center text-lg font-bold">
        Tổng đài: 0363 636 3636
      </div>
      <footer className="bg-[#13284f] text-gray-300 pt-12 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <img src={`${UPLOAD_BASE_URL}/logo.png`} alt="Logo" className="w-16 h-16 rounded-2xl" />
            <h4 className="text-xl font-bold text-white">Bệnh viện Ánh Dương</h4>
            <div className="space-y-2 text-sm">
              <p>Địa chỉ: Số 01 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
              <p>Email: contact@sunshinehospital.vn</p>
              <p>Điện thoại: 0363 636 3636</p>
            </div>
            <p className="mt-4 text-xs text-gray-500">© 2025 Bệnh viện Ánh Dương. All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Liên kết</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={APP_ROUTES.DOCTORS} className="hover:text-white transition-colors">Đội ngũ bác sĩ</Link></li>
              <li><Link to={APP_ROUTES.BOOKING} className="hover:text-white transition-colors">Đặt lịch khám</Link></li>
              <li><Link to={APP_ROUTES.RESULTS} className="hover:text-white transition-colors">Kết quả xét nghiệm</Link></li>
              <li><Link to={APP_ROUTES.NEWS} className="hover:text-white transition-colors">Tin tức</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Tiện ích</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://baohiemxahoi.gov.vn" target="_blank" className="hover:text-white transition-colors">Tra cứu BHYT</a></li>
              <li><Link to={APP_ROUTES.RESULTS} className="hover:text-white transition-colors">Cổng tra cứu kết quả</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Kết nối</h4>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
            >
              <i className="fab fa-facebook"></i> Facebook
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
