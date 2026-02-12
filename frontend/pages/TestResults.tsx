
import React, { useState } from 'react';
import { patientService } from '../services/hospitalService';
import { Appointment, AppointmentStatus } from '../types';
import { formatDateTime } from '../utils/helpers';
import CustomButton from '../components/ui/CustomButton';

const TestResults: React.FC = () => {
  const [cccd, setCccd] = useState("");
  const [results, setResults] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cccd.length !== 12) {
      setError("Vui lòng nhập đúng 12 số CCCD.");
      return;
    }

    setError("");
    setIsLoading(true);
    setResults([]);

    try {
      const res = await patientService.getAppointments(cccd);
      const data = res.data;
      if (data.length === 0) {
        setError("Bệnh nhân chưa có lịch sử khám bệnh nào.");
      } else {
        // Sort by newest
        data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setResults(data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Không tìm thấy hồ sơ bệnh nhân với số CCCD này.");
      } else {
        setError("Lỗi kết nối máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED: return { color: 'bg-green-500', text: 'Hoàn thành', border: 'border-l-green-500' };
      case AppointmentStatus.PENDING: return { color: 'bg-amber-500', text: 'Chờ khám', border: 'border-l-amber-500' };
      case AppointmentStatus.CONFIRMED: return { color: 'bg-blue-500', text: 'Đã xác nhận', border: 'border-l-blue-500' };
      default: return { color: 'bg-red-500', text: 'Hủy', border: 'border-l-red-500' };
    }
  };

  const completedList = results.filter(r => r.status === AppointmentStatus.COMPLETED);
  const upcomingList = results.filter(r => r.status !== AppointmentStatus.COMPLETED);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="text-center mb-12">
        <p className="text-[#0093E9] font-bold uppercase tracking-widest text-sm mb-2">Tra cứu</p>
        <h1 className="text-4xl font-extrabold mb-4">Kết quả xét nghiệm</h1>
        <p className="text-gray-500">Nhập số CCCD (12 số) để xem lịch sử và kết quả khám.</p>
      </header>

      <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-12">
        <form onSubmit={handleLookup} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-gray-700">Số CCCD</label>
            <input 
              type="text" 
              maxLength={12}
              value={cccd}
              onChange={(e) => setCccd(e.target.value.replace(/\D/g, ''))}
              placeholder="12 chữ số"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50"
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </div>
          <CustomButton type="submit" disabled={isLoading} className="md:mt-7 h-[58px]">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Xem kết quả'}
          </CustomButton>
        </form>
      </section>

      {results.length > 0 && (
        <div className="space-y-12 animate-fade-in-up">
          {upcomingList.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-amber-600 mb-6 flex items-center gap-2">
                <i className="far fa-calendar-alt"></i> Lịch hẹn sắp tới / Chờ khám
              </h2>
              <div className="space-y-4">
                {upcomingList.map(item => (
                  <ResultCard key={item.id} appt={item} statusInfo={getStatusInfo(item.status)} />
                ))}
              </div>
            </div>
          )}

          {completedList.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-green-600 mb-6 flex items-center gap-2">
                <i className="fas fa-clipboard-check"></i> Kết quả khám & Xét nghiệm
              </h2>
              <div className="space-y-4">
                {completedList.map(item => (
                  <ResultCard key={item.id} appt={item} statusInfo={getStatusInfo(item.status)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultCard: React.FC<{ appt: Appointment; statusInfo: any }> = ({ appt, statusInfo }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 border-l-[6px] ${statusInfo.border} transition-all hover:shadow-md`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-xs text-gray-400 font-bold mb-1">
          <i className="far fa-clock mr-1"></i> {formatDateTime(appt.time)}
        </p>
        <h3 className="text-lg font-bold text-gray-900">{appt.departmentName || 'Chuyên khoa'}</h3>
        <p className="text-sm text-[#0093E9] font-medium">BS. {appt.doctorName || 'Chưa chỉ định'}</p>
      </div>
      <span className={`${statusInfo.color} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
        {statusInfo.text}
      </span>
    </div>
    
    {appt.notes && (
      <div className="text-sm text-gray-600 mb-4 italic">
        <strong>Ghi chú:</strong> {appt.notes}
      </div>
    )}

    {appt.testResults && (
      <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
        <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2">
          <i className="fas fa-microscope"></i> Kết quả xét nghiệm:
        </h4>
        <div className="bg-blue-50/50 p-4 rounded-xl text-gray-800 text-sm leading-relaxed">
          {appt.testResults}
        </div>
      </div>
    )}
  </div>
);

export default TestResults;
