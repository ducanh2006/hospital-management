
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, register as registerApi } from '../services/authService';
import CustomButton from '../components/ui/CustomButton';
import { APP_ROUTES } from '../constants/config';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    setFormData({ username: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const data = await loginApi({ username: formData.username, password: formData.password });
        if (data.token) {
          login(data.token, formData.username);
          navigate(APP_ROUTES.ADMIN);
        } else {
          setError("Lỗi: Không nhận được mã xác thực.");
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setIsLoading(false);
          return;
        }
        await registerApi({ username: formData.username, password: formData.password });
        setSuccess("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        setActiveTab('login');
      }
    } catch (err: any) {
      setError(err.response?.data || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex border-b">
          <button 
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-4 font-bold text-sm tracking-widest uppercase transition-all ${
              activeTab === 'login' ? 'text-[#0093E9] border-b-4 border-[#0093E9]' : 'text-gray-400 bg-gray-50'
            }`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 py-4 font-bold text-sm tracking-widest uppercase transition-all ${
              activeTab === 'register' ? 'text-[#0093E9] border-b-4 border-[#0093E9]' : 'text-gray-400 bg-gray-50'
            }`}
          >
            Đăng ký
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">{activeTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
            <p className="text-gray-400 text-sm">{activeTab === 'login' ? 'Vui lòng đăng nhập để quản lý hệ thống' : 'Bắt đầu quản lý bệnh viện của bạn'}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 text-center">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tên đăng nhập</label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                placeholder="Username"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mật khẩu</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                placeholder="********"
              />
            </div>
            {activeTab === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nhập lại mật khẩu</label>
                <input 
                  type="password" 
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  placeholder="********"
                />
              </div>
            )}
            <CustomButton type="submit" className="w-full py-4 rounded-2xl shadow-lg shadow-blue-200" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : activeTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
