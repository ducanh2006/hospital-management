
import React from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/home/HeroSlider';
import { APP_ROUTES, UPLOAD_BASE_URL } from '../constants/config';

const Home: React.FC = () => {
  const quickActions = [
    { title: 'Đặt lịch khám', desc: 'Đăng ký theo chuyên khoa, chọn bác sĩ', path: APP_ROUTES.BOOKING, icon: 'fa-calendar-plus' },
    { title: 'Kết quả xét nghiệm', desc: 'Tra cứu trực tuyến an toàn', path: APP_ROUTES.RESULTS, icon: 'fa-file-medical' },
    { title: 'Tin tức', desc: 'Thông tin được cập nhật liên tục', path: APP_ROUTES.NEWS, icon: 'fa-newspaper' },
    { title: 'Đội ngũ bác sĩ', desc: 'Đến với đội ngũ bác sĩ của chúng tôi', path: APP_ROUTES.DOCTORS, icon: 'fa-user-md' },
  ];

  return (
    <div className="container mx-auto px-4 pb-12">
      <HeroSlider />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
        {quickActions.map((action, i) => (
          <Link 
            key={i} 
            to={action.path}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:translate-y-[-8px] transition-all hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-blue-50 text-[#0093E9] rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl group-hover:bg-[#0093E9] group-hover:text-white transition-colors">
              <i className={`fas ${action.icon}`}></i>
            </div>
            <h4 className="text-xl font-bold mb-2 text-gray-900">{action.title}</h4>
            <p className="text-sm text-gray-500">{action.desc}</p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
        <div className="bg-white p-8 rounded-3xl shadow-lg border-l-8 border-[#0093E9]">
          <h3 className="text-2xl font-extrabold mb-4">Giới thiệu</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Bệnh viện Ánh Dương là bệnh viện đa khoa với nhiệm vụ chăm sóc sức khỏe toàn diện cho cộng đồng. 
            Bệnh viện được xây dựng theo mô hình hiện đại, kết hợp giữa khám chữa bệnh, đào tạo, nghiên cứu và hợp tác quốc tế.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Với hệ thống cơ sở vật chất đồng bộ và đội ngũ chuyên gia đầu ngành, bệnh viện tiếp nhận hàng nghìn lượt khám chữa bệnh mỗi ngày.
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#0093E9] to-[#007bbd] p-8 rounded-3xl shadow-lg text-white">
          <h3 className="text-2xl font-extrabold mb-4">Trao gửi yêu thương - lan tỏa Ánh Dương</h3>
          <p className="opacity-90 leading-relaxed">
            Với khát khao sẻ chia và những tấm lòng của các bệnh nhân, Bệnh viện Ánh Dương luôn nỗ lực hết mình và sức mạnh "Lan tỏa Ánh Dương". 
            Chúng tôi cam kết mang lại sự an tâm tuyệt đối cho mọi gia đình.
          </p>
        </div>
      </section>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 text-[#b45309]">Bản đồ bệnh viện</h3>
        <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200">
          <iframe
            src="https://www.google.com/maps?q=B1%20B%C3%A1ch%20Khoa%2C%20Hai%20B%C3%A0%20Tr%C6%B0ng%2C%20H%C3%A0%20N%E1%BB%99i&output=embed"
            className="w-full h-full"
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Home;
