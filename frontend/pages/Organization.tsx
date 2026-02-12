
import React from 'react';
import { UPLOAD_BASE_URL } from '../constants/config';

const Organization: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h2 className="text-3xl font-extrabold mb-12">Ban lãnh đạo Bệnh viện</h2>
        
        <div className="max-w-xs mx-auto mb-12">
          <article className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 group hover:translate-y-[-10px] transition-all">
            <img 
              src={`${UPLOAD_BASE_URL}/leader-director.png`} 
              alt="Giám đốc" 
              className="w-full h-64 object-cover rounded-2xl mb-4 grayscale group-hover:grayscale-0 transition-all"
            />
            <h3 className="text-lg font-bold text-[#0093E9]">Giám đốc bệnh viện</h3>
            <p className="text-gray-600 font-medium">PGS.TS Trần Ngọc Linh</p>
          </article>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <article className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 group hover:translate-y-[-10px] transition-all">
            <img 
              src={`${UPLOAD_BASE_URL}/leader-deputy-1.png`} 
              alt="Phó giám đốc" 
              className="w-full h-56 object-cover rounded-2xl mb-4 grayscale group-hover:grayscale-0 transition-all"
            />
            <h3 className="text-lg font-bold text-[#0093E9]">Phó giám đốc bệnh viện</h3>
            <p className="text-gray-600 font-medium">PGS.TS Đinh Huy Hoàng</p>
          </article>

          <article className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 group hover:translate-y-[-10px] transition-all">
            <img 
              src={`${UPLOAD_BASE_URL}/leader-deputy-2.png`} 
              alt="Phó giám đốc" 
              className="w-full h-56 object-cover rounded-2xl mb-4 grayscale group-hover:grayscale-0 transition-all"
            />
            <h3 className="text-lg font-bold text-[#0093E9]">Phó giám đốc bệnh viện</h3>
            <p className="text-gray-600 font-medium">PGS.TS Dương Đức Anh</p>
          </article>
        </div>
      </section>

      <section className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold bg-[#1c6bbb] text-white inline-block px-12 py-3 rounded-full shadow-lg">Sơ đồ tổ chức</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-3xl overflow-hidden border border-gray-200">
          {[
            {
              title: "Phòng chức năng & Trung tâm",
              items: ["Phòng Kế hoạch tổng hợp", "Phòng Tổ chức cán bộ", "Phòng Hành chính quản trị", "Phòng Tài chính - Kế toán", "Trung tâm Đào tạo & Truyền thông"]
            },
            {
              title: "Khối Lâm sàng",
              items: ["Khoa Nội tổng hợp", "Khoa Ngoại tổng hợp", "Khoa Hồi sức tích cực", "Khoa Nhi", "Khoa Sản"]
            },
            {
              title: "Khối Cận lâm sàng",
              items: ["Khoa Xét nghiệm", "Khoa Chẩn đoán hình ảnh", "Khoa Thẩm định chất lượng", "Ngân hàng máu"]
            },
            {
              title: "Khối Dịch vụ & Hỗ trợ",
              items: ["Trung tâm Khám bệnh theo yêu cầu", "Phòng Công nghệ thông tin", "Phòng Vật tư - Thiết bị y tế", "Phòng Điều dưỡng"]
            }
          ].map((col, idx) => (
            <div key={idx} className="bg-white flex flex-col">
              <div className="bg-[#fd8b49] text-white font-bold text-sm px-6 py-4">{col.title}</div>
              <ul className="p-6 space-y-3 flex-1 bg-gray-50/50">
                {col.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Organization;
