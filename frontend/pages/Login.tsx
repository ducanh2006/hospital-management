import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants/config';

// Icon Google SVG
const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  // Nếu đã đăng nhập → chuyển thẳng đến Admin
  if (!isLoading && isAuthenticated) {
    return <Navigate to={APP_ROUTES.ADMIN} replace />;
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 50%, #ECFDF5 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #f1f5f9',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0093E9 0%, #0066CC 100%)',
          padding: '40px 40px 36px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
          }}>
            🏥
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>
            Sunshine Hospital
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>
            Hệ thống quản lý bệnh viện
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
              Chào mừng trở lại!
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Đăng nhập để truy cập hệ thống quản lý
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ padding: '0 12px', color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>
              Đăng nhập bằng
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Nút đăng nhập Keycloak (tài khoản / Google) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Nút Google */}
            <button
              onClick={login}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 20px',
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#4285F4';
                (e.currentTarget as HTMLButtonElement).style.background = '#f8faff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
              }}
              id="btn-login-google"
            >
              <GoogleIcon />
              <span>Tiếp tục với Google</span>
            </button>

            {/* Nút tài khoản Keycloak thông thường */}
            <button
              onClick={login}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #0093E9 0%, #0066CC 100%)',
                border: 'none',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: '0 4px 15px rgba(0,147,233,0.35)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(0,147,233,0.45)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(0,147,233,0.35)';
              }}
              id="btn-login-keycloak"
            >
              🔐 <span>Đăng nhập bằng tài khoản</span>
            </button>

          </div>

          {/* Info note */}
          <div style={{
            marginTop: '28px',
            padding: '14px 16px',
            background: '#f0f9ff',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
          }}>
            <p style={{ color: '#0369a1', fontSize: '12px', margin: 0, lineHeight: '1.6', textAlign: 'center' }}>
              🔒 Đăng nhập được bảo mật bởi <strong>Keycloak</strong>.<br />
              Tài khoản của bạn cần có quyền phù hợp (admin / doctor / patient).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
