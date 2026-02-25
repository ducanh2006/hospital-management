
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_ROUTES, UPLOAD_BASE_URL } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { accountService, profileService, patientService, doctorService, ProfileDTO } from '../../services/hospitalService';

/** Lấy màu badge theo role */
const roleBadgeStyle = (role: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    admin: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    doctor: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
    patient: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  };
  return map[role] ?? { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
};

/** Lấy nhãn hiển thị của role */
const roleLabel = (role: string) => {
  const map: Record<string, string> = { admin: 'Admin', doctor: 'Bác sĩ', patient: 'Bệnh nhân' };
  return map[role] ?? role;
};

/** Phát hiện đăng nhập bằng Google (email provider = google) */
const isGoogleAccount = (email?: string) => {
  if (!email) return false;
  return email.endsWith('@gmail.com');
};

/* ─────────────────────────────────────────────────────────────
   ProfileModal — đọc/ghi /api/accounts/me/profile
   ───────────────────────────────────────────────────────────── */
interface ProfileModalProps {
  user: { username: string; email?: string; firstName?: string; lastName?: string };
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px', borderRadius: 12,
  border: '1.5px solid #e2e8f0', fontSize: 14,
  outline: 'none', background: '#f8fafc',
};

const btnSecondaryStyle: React.CSSProperties = {
  flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#64748b',
};

const btnPrimaryStyle = (saving: boolean): React.CSSProperties => ({
  flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0093E9, #0066CC)', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', color: 'white', boxShadow: saving ? 'none' : '0 4px 12px rgba(0,147,233,0.3)',
});

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  const { hasRole } = useAuth();
  const isPatient = hasRole('patient');
  const isDoctor = hasRole('doctor');

  const [profileForm, setProfileForm] = useState<Partial<ProfileDTO>>({});
  const [patientForm, setPatientForm] = useState<any>({});
  const [doctorForm, setDoctorForm] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build promises and remember their positions so we can read results reliably
        const promises: Promise<any>[] = [];
        const profileIndex = promises.push(profileService.getMe()) - 1;
        const patientIndex = isPatient ? promises.push(patientService.getMe()) - 1 : -1;
        const doctorIndex = isDoctor ? promises.push(doctorService.getMe()) - 1 : -1;

        const results = await Promise.all(promises);
        setProfileForm(results[profileIndex]?.data || {});
        if (patientIndex !== -1) setPatientForm(results[patientIndex]?.data || {});
        if (doctorIndex !== -1) setDoctorForm(results[doctorIndex]?.data || {});
      } catch (err) {
        console.warn('Failed to fetch full profile data, using fallback defaults');
        setProfileForm({
          fullName: user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.username,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updates: Promise<any>[] = [profileService.updateMe(profileForm)];
      if (isPatient) updates.push(patientService.updateMe(patientForm));
      if (isDoctor) updates.push(doctorService.updateMe(doctorForm));

      await Promise.all(updates);
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Lưu thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null; // Or a spinner

  const gmailLocked = isGoogleAccount(user.email);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 24, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.22s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0093E9, #0066CC)',
          padding: '24px 28px 20px',
          position: 'relative',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10,
          }}>
            {(user.firstName?.[0] || user.username[0]).toUpperCase()}
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
            {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.username}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 }}>
            {user.email ?? user.username}
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', width: 32, height: 32, borderRadius: '50%',
              cursor: 'pointer', fontSize: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: '24px 28px 28px' }}>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Cập nhật thông tin cá nhân và nghề nghiệp của bạn.
          </p>

          <section>
            <h4 style={{ fontSize: 12, color: '#0066CC', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 16 }}>THÔNG TIN CHUNG</h4>

            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Họ và tên</label>
              <input
                type="text"
                value={profileForm.fullName || ''}
                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* CCCD */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>CCCD</label>
                <input
                  type="text"
                  value={profileForm.identityNumber || ''}
                  onChange={e => setProfileForm({ ...profileForm, identityNumber: e.target.value })}
                  placeholder="12 số"
                  maxLength={12}
                  style={inputStyle}
                />
              </div>
              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber || ''}
                  onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Giới tính</label>
                <select
                  value={profileForm.gender || ''}
                  onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Chọn...</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              {/* DOB */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Ngày sinh</label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth || ''}
                  onChange={e => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Địa chỉ</label>
              <textarea
                value={profileForm.address || ''}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              />
            </div>
          </section>

          {isPatient && (
            <section style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 12, color: '#0066CC', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 16 }}>HỒ SƠ BỆNH NHÂN</h4>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Số BHYT</label>
                <input
                  type="text"
                  value={patientForm.insuranceNumber || ''}
                  onChange={e => setPatientForm({ ...patientForm, insuranceNumber: e.target.value })}
                  style={inputStyle}
                  placeholder="DN401..."
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Số điện thoại khẩn cấp</label>
                <input
                  type="tel"
                  value={patientForm.emergencyContactPhone || ''}
                  onChange={e => setPatientForm({ ...patientForm, emergencyContactPhone: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </section>
          )}

          {isDoctor && (
            <section style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 12, color: '#0066CC', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 16 }}>THÔNG TIN BÁC SĨ</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Chuyên khoa</label>
                  <input
                    type="text"
                    value={doctorForm.specialization || ''}
                    onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Số năm kinh nghiệm</label>
                  <input
                    type="number"
                    value={doctorForm.experienceYear || ''}
                    onChange={e => setDoctorForm({ ...doctorForm, experienceYear: parseInt(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Tiểu sử / Bio</label>
                <textarea
                  value={doctorForm.bio || ''}
                  onChange={e => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                />
              </div>
            </section>
          )}

          {/* Error / Success */}
          {error && <div style={{ marginBottom: 16, color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>}
          {success && <div style={{ marginBottom: 16, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>✅ Đã cập nhật thành công!</div>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>Hủy</button>
            <button type="submit" disabled={saving} style={btnPrimaryStyle(saving)}>
              {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Header
   ───────────────────────────────────────────────────────────── */
const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { isAuthenticated, isLoading, user, login, logout, hasRole } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Xác định role hiển thị chính
  const primaryRole = hasRole('admin') ? 'admin' : hasRole('doctor') ? 'doctor' : hasRole('patient') ? 'patient' : null;

  const navItems = [
    { path: APP_ROUTES.HOME, label: 'Trang chủ' },
    { path: APP_ROUTES.ABOUT, label: 'Giới thiệu' },
    { path: APP_ROUTES.ORG, label: 'Cơ cấu tổ chức' },
    { path: APP_ROUTES.BOOKING, label: 'Đặt lịch khám' },
    { path: APP_ROUTES.DOCTORS, label: 'Đội ngũ bác sĩ' },
    { path: APP_ROUTES.NEWS, label: 'Tin tức' },
    { path: APP_ROUTES.RESULTS, label: 'Kết quả xét nghiệm' },
    { path: APP_ROUTES.ADMIN, label: 'Quản lý hệ thống' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
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

          {/* User auth section (top-right) */}
          <div style={{ position: 'relative' }}>
            {isLoading ? (
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #0093E9', animation: 'spin 0.8s linear infinite' }} />
            ) : isAuthenticated && user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 14px', borderRadius: '999px',
                    border: '1.5px solid #e2e8f0', background: 'white',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#0093E9')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  id="btn-user-menu"
                >
                  {/* Avatar initials */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0093E9, #0066CC)',
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>
                    {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                  </div>

                  <div style={{ textAlign: 'left', maxWidth: 140 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.username}
                    </div>
                    {primaryRole && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999, ...roleBadgeStyle(primaryRole) }}>
                        {roleLabel(primaryRole)}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>▾</span>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.12)', minWidth: 210, overflow: 'hidden',
                      zIndex: 999,
                      animation: 'dropIn 0.15s cubic-bezier(.34,1.56,.64,1)',
                    }}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    {/* User info */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                        {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.username}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
                    </div>

                    {/* Chỉnh sửa thông tin */}
                    <button
                      onClick={() => { setShowDropdown(false); setShowProfileModal(true); }}
                      style={{
                        width: '100%', padding: '11px 16px', background: 'none',
                        border: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer',
                        color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      id="btn-edit-profile"
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                      }}>✏️</span>
                      Chỉnh sửa thông tin
                    </button>

                    <div style={{ margin: '0 12px', height: 1, background: '#f1f5f9' }} />

                    {/* Đăng xuất */}
                    <button
                      onClick={() => { setShowDropdown(false); logout(); }}
                      style={{
                        width: '100%', padding: '11px 16px', background: 'none',
                        border: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer',
                        color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      id="btn-logout"
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: '#fee2e2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                      }}>🚪</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                style={{
                  padding: '8px 20px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #0093E9, #0066CC)',
                  color: 'white', border: 'none', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 10px rgba(0,147,233,0.3)',
                }}
                id="btn-login-header"
              >
                🔐 Đăng nhập
              </button>
            )}
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="bg-gradient-to-r from-[#0093E9] to-[#007bbd] text-white overflow-x-auto">
          <div className="container mx-auto px-4">
            <ul className="flex justify-center whitespace-nowrap">
              {navItems.map((item) => (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`block px-5 py-4 font-medium transition-colors hover:bg-white/10 ${isActive(item.path) ? 'bg-white/20' : ''}`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <style>{`
          @keyframes spin   { to { transform: rotate(360deg); } }
          @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </header>

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Header;
