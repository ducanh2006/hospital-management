
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService, accountService, appointmentService } from '../services/hospitalService';
import { Doctor } from '../types';
import { getImageUrl, getGenderText } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/ui/CustomButton';

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || "");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");

  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [docError, setDocError] = useState(false);

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
      } catch {
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

    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đặt lịch khám.");
      login();
      return;
    }

    if (!doctorInfo) {
      alert("Vui lòng nhập ID Bác sĩ hợp lệ.");
      return;
    }

    try {
      // Lấy patient record của người dùng hiện tại qua JWT
      const apptRes = await accountService.getMyAppointments().catch(() => null);

      // Lấy patient.id từ bất kỳ appointment đã có, hoặc gọi thêm endpoint nếu cần
      // Backend tự tìm qua JWT → account → profile → patient
      await createAppointment();
    } catch (err: any) {
      if (err.response?.status === 404) {
        alert(
          "Bạn chưa có hồ sơ bệnh nhân trong hệ thống.\n" +
          "Hãy liên hệ quầy tiếp nhận hoặc admin để tạo hồ sơ trước khi đặt lịch trực tuyến."
        );
      } else {
        alert("Lỗi kiểm tra thông tin bệnh nhân. Vui lòng thử lại.");
      }
    }
  };

  const createAppointment = async () => {
    try {
      // Backend đọc JWT để lấy patient.id tự động
      const payload = {
        doctorId: parseInt(doctorId),
        departmentId: doctorInfo?.departmentId || null,
        time: bookingTime,
        status: "PENDING",
        notes: notes
        // patientId sẽ được backend tự resolve từ JWT
      };

      await appointmentService.create(payload);
      alert("ĐẶT LỊCH THÀNH CÔNG! Hệ thống đã ghi nhận lịch khám.");
      window.location.reload();
    } catch (err: any) {
      if (err.response?.status === 404) {
        alert(
          "Tài khoản của bạn chưa có hồ sơ bệnh nhân.\n" +
          "Vui lòng liên hệ bệnh viện hoặc admin để tạo hồ sơ."
        );
      } else {
        alert("Lỗi đặt lịch khám. Vui lòng thử lại.");
      }
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

          {/* Login required warning */}
          {!authLoading && !isAuthenticated && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">Bạn chưa đăng nhập</p>
                <p className="text-sm text-amber-700">Hãy đăng nhập để hệ thống nhận diện hồ sơ bệnh nhân của bạn.</p>
              </div>
              <button
                onClick={login}
                className="ml-auto shrink-0 px-4 py-2 bg-[#0093E9] text-white rounded-xl text-sm font-bold"
              >
                Đăng nhập
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <CustomButton type="submit" className="w-full py-4 text-lg" disabled={!isAuthenticated}>
              {isAuthenticated ? "Xác nhận Đặt lịch" : "Đăng nhập để đặt lịch"}
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
                src={getImageUrl(doctorInfo.pictureUrl, doctorInfo.gender)}
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
                <p>📞 <strong>SĐT:</strong> {doctorInfo.phoneNumber || 'Liên hệ bệnh viện'}</p>
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
    </div>
  );
};

export default Booking;
