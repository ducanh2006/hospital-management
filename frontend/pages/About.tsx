
import React from 'react';
import { UPLOAD_BASE_URL } from '../constants/config';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Bệnh viện Ánh Dương là bệnh viện đa khoa với nhiệm vụ chăm sóc sức khỏe toàn diện cho cộng đồng. 
            Bệnh viện được xây dựng theo mô hình hiện đại, kết hợp giữa khám chữa bệnh, đào tạo, nghiên cứu và hợp tác quốc tế.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Với hệ thống cơ sở vật chất đồng bộ và đội ngũ chuyên gia đầu ngành, chúng tôi tự hào mang đến dịch vụ y tế chuẩn mực.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Tầm nhìn & Sứ mệnh</h2>
          <div className="mb-6">
            <h3 className="font-bold text-[#0093E9] mb-2">Tầm nhìn</h3>
            <p className="text-gray-600">Trở thành bệnh viện tuyến cuối hàng đầu khu vực, là địa chỉ tin cậy của người bệnh và đối tác.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#0093E9] mb-2">Sứ mệnh</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Cung cấp dịch vụ y tế an toàn, hiệu quả và nhân văn.</li>
              <li>Ứng dụng các kỹ thuật cao trong chẩn đoán và điều trị.</li>
              <li>Góp phần nâng cao chất lượng chăm sóc sức khỏe cộng đồng.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Hình ảnh bệnh viện</h2>
          <img src={`${UPLOAD_BASE_URL}/hospital.png`} alt="Bệnh viện" className="w-full h-64 object-cover rounded-2xl shadow-md" />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Hoạt động nổi bật</h2>
          <img src={`${UPLOAD_BASE_URL}/volunteer.png`} alt="Thiện nguyện" className="w-full h-64 object-cover rounded-2xl shadow-md" />
        </div>
      </div>

      <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-8">Lịch sử phát triển</h2>
        <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
          {[
            { year: '1999', text: 'Thành lập bệnh viện với quy mô 150 giường bệnh.' },
            { year: '2008', text: 'Mở rộng khối nội trú lên 300 giường, triển khai nhiều chuyên khoa sâu.' },
            { year: '2015', text: 'Ứng dụng rộng rãi kỹ thuật nội soi, can thiệp mạch và kỹ thuật cao.' },
            { year: '2023', text: 'Hoàn thiện hệ thống khám bệnh thông minh, đặt lịch trực tuyến.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-6 pl-10 relative">
              <span className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-100 text-[#0093E9] flex items-center justify-center font-bold text-xs ring-4 ring-white">
                {item.year.slice(2)}
              </span>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold text-sm mb-2">{item.year}</span>
                <p className="text-gray-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
