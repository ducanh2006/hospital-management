
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService, patientService, appointmentService } from '../services/hospitalService';
import { Doctor, Gender } from '../types';
import { getImageUrl, getGenderText } from '../utils/helpers';
import CustomButton from '../components/ui/CustomButton';

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || "");
  const [cccd, setCccd] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [docError, setDocError] = useState(false);

  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    fullName: '',
    dob: '',
    gender: Gender.MALE,
    phone: '',
    address: ''
  });

  // Handle Debounced Doctor Search
  useEffect(() => {
    if (!doctorId) {
      setDoctorInfo(null);
      setDocError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingDoc(true);
      setDocError(false);
      try {
        const res = await doctorService.getById(doctorId);
        setDoctorInfo(res.data);
      } catch (err) {
        setDoctorInfo(null);
        setDocError(true);
      } finally {
        setIsLoadingDoc(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorInfo) {
      alert("Vui lòng nhập ID Bác sĩ hợp lệ.");
      return;
    }

    if (cccd.length < 9) {
      alert("Vui lòng nhập CCCD hợp lệ.");
      return;
    }

    try {
      const checkRes = await patientService.getById(cccd);
      // If patient exists, proceed to book
      await createAppointment();
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Patient doesn't exist, open registration
        setShowRegModal(true);
      } else {
        alert("Lỗi kiểm tra thông tin bệnh nhân.");
      }
    }
  };

  const createAppointment = async () => {
    try {
      const payload = {
        patientIdentityNumber: parseInt(cccd),
        doctorId: parseInt(doctorId),
        departmentId: doctorInfo?.departmentId || null,
        time: bookingTime,
        status: "PENDING",
        notes: notes
      };

      await appointmentService.create(payload);
      alert("ĐẶT LỊCH THÀNH CÔNG! Hệ thống đã ghi nhận lịch khám.");
      window.location.reload();
    } catch (err) {
      alert("Lỗi đặt lịch khám. Vui lòng thử lại.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patientData = {
        identityNumber: parseInt(cccd),
        fullName: regForm.fullName,
        gender: regForm.gender,
        dateOfBirth: regForm.dob || null,
        phone: regForm.phone,
        address: regForm.address,
        lastUpdate: new Date().toISOString()
      };

      await patientService.create(patientData);
      alert("Đăng ký hồ sơ thành công! Đang tiến hành đặt lịch...");
      setShowRegModal(false);
      await createAppointment();
    } catch (err) {
      alert("Lỗi tạo hồ sơ bệnh nhân.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Booking Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <i className="fas fa-calendar-alt text-[#0093E9]"></i> Thông tin đặt lịch
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Số CCCD / CMND <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" 
                  placeholder="Nhập 12 số CCCD..." 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mã số Bác sĩ (ID) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" 
                  placeholder="Nhập ID bác sĩ..." 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Thời gian khám <span className="text-red-500">*</span></label>
              <input 
                type="datetime-local" 
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Ghi chú / Triệu chứng</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" 
                placeholder="Mô tả sơ qua về tình trạng sức khỏe..."
              ></textarea>
            </div>

            <CustomButton type="submit" className="w-full py-4 text-lg">
              Xác nhận Đặt lịch
            </CustomButton>
          </form>
        </div>

        {/* Doctor Preview */}
        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-300 h-fit sticky top-28 text-center min-h-[400px] flex flex-col items-center justify-center">
          {isLoadingDoc ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Đang tìm bác sĩ...</p>
            </div>
          ) : doctorInfo ? (
            <div className="w-full animate-fade-in-up">
              <img 
                src={getImageUrl(doctorInfo.photoUrl, doctorInfo.gender)} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-[#0093E9] mb-1">{doctorInfo.fullName}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{doctorInfo.specialization}</p>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm text-left text-sm space-y-3">
                <p>👤 <strong>Giới tính:</strong> {getGenderText(doctorInfo.gender)}</p>
                <p>🎓 <strong>Kinh nghiệm:</strong> {doctorInfo.experienceYear} năm</p>
                <p>⭐ <strong>Đánh giá:</strong> <span className="text-yellow-500 font-bold">{doctorInfo.avgRating?.toFixed(1) || '0.0'} / 5.0</span></p>
                <hr className="border-dashed" />
                <p>📧 <strong>Email:</strong> {doctorInfo.email || 'Liên hệ bệnh viện'}</p>
                <p>📞 <strong>SĐT:</strong> {doctorInfo.phone || 'Liên hệ bệnh viện'}</p>
              </div>
            </div>
          ) : docError ? (
            <div className="text-red-500">
              <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
              <h4 className="font-bold">Không tìm thấy bác sĩ</h4>
              <p className="text-sm">Vui lòng kiểm tra lại ID bác sĩ.</p>
            </div>
          ) : (
            <div className="opacity-40 grayscale flex flex-col items-center">
              <i className="fas fa-user-md text-6xl mb-4"></i>
              <p className="text-gray-600 font-medium">Nhập ID để xem thông tin bác sĩ</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-[#0093E9] text-center mb-2">Đăng ký hồ sơ bệnh nhân</h2>
            <p className="text-center text-gray-500 mb-8">CCCD này chưa tồn tại trong hệ thống. Vui lòng tạo hồ sơ mới.</p>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Họ và tên <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({...regForm, fullName: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Ngày sinh</label>
                  <input 
                    type="date" 
                    value={regForm.dob}
                    onChange={(e) => setRegForm({...regForm, dob: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Giới tính</label>
                  <select 
                    value={regForm.gender}
                    onChange={(e) => setRegForm({...regForm, gender: e.target.value as Gender})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value={Gender.MALE}>Nam</option>
                    <option value={Gender.FEMALE}>Nữ</option>
                    <option value={Gender.OTHER}>Khác</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Số điện thoại <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={regForm.phone}
                  onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Địa chỉ</label>
                <input 
                  type="text" 
                  value={regForm.address}
                  onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" 
                />
              </div>

              <div className="flex gap-4 mt-8">
                <CustomButton variant="secondary" className="flex-1" onClick={() => setShowRegModal(false)}>Hủy</CustomButton>
                <CustomButton type="submit" className="flex-[2]">Lưu hồ sơ & Tiếp tục</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
