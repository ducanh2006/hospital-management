
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  doctorService,
  patientService,
  departmentService,
  appointmentService,
  newsService,
  pictureService
} from '../services/hospitalService';
import { updatePassword } from '../services/authService';
import { Doctor, Patient, Appointment, Department, MedicalNews, AppointmentStatus } from '../types';
import CustomButton from '../components/ui/CustomButton';
import { getImageUrl, formatDateTime } from '../utils/helpers';

type Tab = 'patients' | 'doctors' | 'departments' | 'appointments' | 'news';

const Admin: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, hasRole, login } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('patients');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lookups
  const [depts, setDepts] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const tabs: { id: Tab, label: string }[] = [
    { id: 'patients', label: 'Bệnh nhân' },
    { id: 'doctors', label: 'Bác sĩ' },
    { id: 'departments', label: 'Khoa' },
    { id: 'appointments', label: 'Lịch hẹn' },
    { id: 'news', label: 'Tin tức' }
  ];

  const fetchData = async (tab: Tab) => {
    setIsLoading(true);
    try {
      let res;
      switch (tab) {
        case 'patients': res = await patientService.getAll(); break;
        case 'doctors': res = await doctorService.getAllWithRating(); break;
        case 'departments': res = await departmentService.getAll(); break;
        case 'appointments': res = await appointmentService.getAll(); break;
        case 'news': res = await newsService.getAll(); break;
      }
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (hasRole('admin') || hasRole('doctor'))) {
      fetchData(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || (!hasRole('admin') && !hasRole('doctor'))) return;
    const loadLookups = async () => {
      const [dRes, drRes] = await Promise.all([
        departmentService.getAll(),
        doctorService.getAll()
      ]);
      setDepts(dRes.data);
      setDoctors(drRes.data);
    };
    loadLookups();
  }, [isAuthenticated]);

  const handleDelete = async (id: any) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      switch (activeTab) {
        case 'patients': await patientService.delete(id); break;
        case 'doctors': await doctorService.delete(id); break;
        case 'departments': await departmentService.delete(id); break;
        case 'appointments': await appointmentService.delete(id); break;
        case 'news': await newsService.delete(id); break;
      }
      fetchData(activeTab);
    } catch (err) {
      alert("Lỗi khi xóa dữ liệu.");
    }
  };

  const openModal = (item?: any) => {
    setIsEdit(!!item);
    setFormData(item || {});
    setPreviewImg(item?.photoUrl || null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dataToSave = { ...formData };

      // Handle file upload for doctors
      if (activeTab === 'doctors' && selectedFile) {
        const upRes = await pictureService.upload(selectedFile);
        dataToSave.pictureId = upRes.data.id;
      }

      switch (activeTab) {
        case 'patients':
          if (isEdit) await patientService.update(dataToSave.identityNumber, dataToSave);
          else await patientService.create(dataToSave);
          break;
        case 'doctors':
          if (isEdit) await doctorService.update(dataToSave.id, dataToSave);
          else await doctorService.create(dataToSave);
          break;
        case 'departments':
          if (isEdit) await departmentService.update(dataToSave.id, dataToSave);
          else await departmentService.create(dataToSave);
          break;
        case 'appointments':
          if (isEdit) await appointmentService.update(dataToSave.id, dataToSave);
          else await appointmentService.create(dataToSave);
          break;
        case 'news':
          if (isEdit) await newsService.update(dataToSave.id, dataToSave);
          else await newsService.create(dataToSave);
          break;
      }
      setIsModalOpen(false);
      fetchData(activeTab);
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu.");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !user?.username) return;
    try {
      await updatePassword(user.username, newPassword);
      alert("Đổi mật khẩu thành công!");
      setIsPasswordModalOpen(false);
      setNewPassword("");
    } catch (err) {
      alert("Lỗi đổi mật khẩu.");
    }
  };

  // ── 1. Đang kiểm tra xác thực ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, color: '#64748b',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '4px solid #e2e8f0', borderTop: '4px solid #0093E9',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ margin: 0, fontSize: 14 }}>Đang kiểm tra xác thực...</p>
      </div>
    );
  }

  // ── 2. Chưa đăng nhập ─────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        textAlign: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 72 }}>🔒</div>
        <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 26, margin: 0 }}>
          Yêu cầu đăng nhập
        </h2>
        <p style={{ color: '#64748b', margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
          Bạn cần đăng nhập với tài khoản <strong>Admin</strong> hoặc <strong>Bác sĩ</strong> để truy cập trang quản lý.
        </p>
        <button
          onClick={login}
          style={{
            marginTop: 8, padding: '12px 32px', borderRadius: 12,
            background: 'linear-gradient(135deg, #0093E9, #80D0C7)',
            color: 'white', border: 'none', fontWeight: 700,
            cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 15px rgba(0,147,233,0.3)',
          }}
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // ── 3. Đã đăng nhập nhưng không đủ quyền ─────────────────────────────────
  if (!hasRole('admin') && !hasRole('doctor')) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        textAlign: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 72 }}>🚫</div>
        <h2 style={{ color: '#dc2626', fontWeight: 800, fontSize: 26, margin: 0 }}>
          Không có quyền truy cập
        </h2>
        <p style={{ color: '#64748b', margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
          Trang quản lý chỉ dành cho tài khoản <strong>Admin</strong> hoặc <strong>Bác sĩ</strong>.<br />
          Tài khoản <strong>{user?.username}</strong> không có quyền này.
        </p>
      </div>
    );
  }

  // ── 4. Có quyền → hiển thị giao diện quản lý ─────────────────────────────
  return (
    <div>
      {/* Admin Sub-Nav */}
      <nav style={{
        background: 'linear-gradient(135deg, #6b21a8, #2563eb)',
        padding: '0 32px', display: 'flex', alignItems: 'center',
        overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 20px', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid white' : '3px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.55)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="container mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 border-b flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <CustomButton onClick={() => openModal()} className="px-5 py-2">
              <i className="fas fa-plus mr-2"></i> Thêm mới
            </CustomButton>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    {activeTab === 'patients' && <>
                      <th className="px-6 py-4">CCCD</th>
                      <th className="px-6 py-4">Họ tên</th>
                      <th className="px-6 py-4">Giới tính</th>
                      <th className="px-6 py-4">SĐT</th>
                      <th className="px-6 py-4">Địa chỉ</th>
                    </>}
                    {activeTab === 'doctors' && <>
                      <th className="px-4 py-4">Ảnh</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Họ tên</th>
                      <th className="px-6 py-4">Chuyên môn</th>
                      <th className="px-6 py-4">SĐT</th>
                      <th className="px-6 py-4">Khoa</th>
                    </>}
                    {activeTab === 'departments' && <>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Tên khoa</th>
                      <th className="px-6 py-4">SĐT</th>
                      <th className="px-6 py-4">Mô tả</th>
                    </>}
                    {activeTab === 'appointments' && <>
                      <th className="px-6 py-4">Mã LH</th>
                      <th className="px-6 py-4">Bệnh nhân (CCCD)</th>
                      <th className="px-6 py-4">Bác sĩ</th>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Trạng thái</th>
                    </>}
                    {activeTab === 'news' && <>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Tiêu đề</th>
                      <th className="px-6 py-4">Cập nhật</th>
                    </>}
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {activeTab === 'patients' && <>
                        <td className="px-6 py-4 font-bold">{item.identityNumber}</td>
                        <td className="px-6 py-4">{item.fullName}</td>
                        <td className="px-6 py-4">{item.gender}</td>
                        <td className="px-6 py-4">{item.phone}</td>
                        <td className="px-6 py-4 text-gray-500">{item.address}</td>
                      </>}
                      {activeTab === 'doctors' && <>
                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(item.pictureUrl, item.gender, null)}
                            alt={item.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = getImageUrl(null, item.gender); }}
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-500">{item.id}</td>
                        <td className="px-6 py-4 font-semibold text-blue-600">{item.fullName}</td>
                        <td className="px-6 py-4">{item.specialization}</td>
                        <td className="px-6 py-4">{item.phone}</td>
                        <td className="px-6 py-4">{depts.find(d => d.id === item.departmentId)?.name}</td>
                      </>}
                      {activeTab === 'departments' && <>
                        <td className="px-6 py-4 font-bold">{item.id}</td>
                        <td className="px-6 py-4 font-semibold">{item.name}</td>
                        <td className="px-6 py-4">{item.phone}</td>
                        <td className="px-6 py-4 text-gray-500 line-clamp-1">{item.description}</td>
                      </>}
                      {activeTab === 'appointments' && <>
                        <td className="px-6 py-4 font-bold">{item.id}</td>
                        <td className="px-6 py-4">{item.patientIdentityNumber}</td>
                        <td className="px-6 py-4 font-semibold text-blue-600">BS. {doctors.find(d => d.id === item.doctorId)?.fullName}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{formatDateTime(item.time)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              item.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                      </>}
                      {activeTab === 'news' && <>
                        <td className="px-6 py-4 font-bold">{item.id}</td>
                        <td className="px-6 py-4 font-semibold">{item.title}</td>
                        <td className="px-6 py-4 text-gray-400">{formatDateTime(item.lastUpdate)}</td>
                      </>}
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button onClick={() => openModal(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><i className="fas fa-edit"></i></button>
                        <button onClick={() => handleDelete(item.id || item.identityNumber)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr><td colSpan={10} className="p-12 text-center text-gray-400 italic">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h2 className="text-2xl font-black mb-6">{isEdit ? 'Cập nhật' : 'Thêm mới'} {tabs.find(t => t.id === activeTab)?.label}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTab === 'patients' && <>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Số CCCD</label>
                  <input type="number" readOnly={isEdit} value={formData.identityNumber || ''} onChange={e => setFormData({ ...formData, identityNumber: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Họ tên</label>
                  <input type="text" value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Giới tính</label>
                  <select value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl">
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">SĐT</label>
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ</label>
                  <input type="text" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" />
                </div>
              </>}
              {activeTab === 'doctors' && <>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Họ tên</label>
                  <input type="text" value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Chuyên môn</label>
                  <input type="text" value={formData.specialization || ''} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Khoa</label>
                  <select value={formData.departmentId || ''} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl">
                    <option value="">Chọn khoa</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">SĐT</label>
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Kinh nghiệm (Năm)</label>
                  <input type="number" value={formData.experienceYear || ''} onChange={e => setFormData({ ...formData, experienceYear: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Ảnh đại diện</label>
                  <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Giới thiệu</label>
                  <textarea value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" rows={3}></textarea>
                </div>
              </>}
              {activeTab === 'appointments' && <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">CCCD Bệnh nhân</label>
                  <input type="number" value={formData.patientIdentityNumber || ''} onChange={e => setFormData({ ...formData, patientIdentityNumber: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Bác sĩ</label>
                  <select value={formData.doctorId || ''} onChange={e => setFormData({ ...formData, doctorId: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl">
                    <option value="">Chọn bác sĩ</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Thời gian</label>
                  <input type="datetime-local" value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</label>
                  <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl">
                    <option value="PENDING">Chờ khám</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Hủy</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Kết quả xét nghiệm</label>
                  <textarea value={formData.testResults || ''} onChange={e => setFormData({ ...formData, testResults: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" rows={4}></textarea>
                </div>
              </>}
              {activeTab === 'news' && <>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" required />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Nội dung</label>
                  <textarea value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl" rows={8} required></textarea>
                </div>
              </>}

              <div className="md:col-span-2 flex gap-4 mt-8 pt-6 border-t">
                <CustomButton variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Hủy</CustomButton>
                <CustomButton type="submit" className="flex-1">Lưu dữ liệu</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-fade-in-up">
            <h2 className="text-xl font-black mb-4">Đổi mật khẩu</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-50"
                  placeholder="********"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <CustomButton variant="secondary" className="flex-1" onClick={() => setIsPasswordModalOpen(false)}>Hủy</CustomButton>
                <CustomButton className="flex-1" onClick={handlePasswordChange}>Cập nhật</CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
