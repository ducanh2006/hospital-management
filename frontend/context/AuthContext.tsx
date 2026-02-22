import React, { createContext, useState, useEffect, useContext } from 'react';
import keycloak from '../services/keycloakService';
import { accountService } from '../services/hospitalService';
import { APP_ROUTES } from '../constants/config';

interface KeycloakUser {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthContextType {
  user: KeycloakUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Module-level flag — ngăn React 18 StrictMode gọi keycloak.init() 2 lần.
 * Keycloak chỉ cho phép init 1 lần trên mỗi instance.
 */
let _keycloakInitialized = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Guard: StrictMode chạy effect 2 lần — bỏ qua lần 2
    if (_keycloakInitialized) {
      if (keycloak.authenticated) refreshUserState();
      setIsLoading(false);
      return;
    }

    _keycloakInitialized = true;

    keycloak
      .init({
        pkceMethod: 'S256',
        checkLoginIframe: false,
        // BrowserRouter: dùng responseMode mặc định (query string)
        // Keycloak redirect về /?code=...&state=... → keycloak-js tự parse token
      })
      .then((authenticated) => {
        console.log('🔑 Keycloak init result:', {
          authenticated,
          currentURL: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
        });

        console.group('🪙 TOKEN INFO');
        console.log('token (raw JWT)  :', keycloak.token ?? '❌ không có token');
        console.log('tokenParsed      :', keycloak.tokenParsed ?? '❌ không có tokenParsed');
        console.log('refreshToken     :', keycloak.refreshToken ?? '❌ không có refreshToken');
        console.log('idToken          :', keycloak.idToken ?? '❌ không có idToken');
        console.groupEnd();

        if (authenticated) {
          refreshUserState();

          // Đồng bộ tài khoản với backend — Bearer token tự động đính kèm bởi api interceptor
          accountService.syncLogin().catch((err) =>
            console.warn('Account sync failed (non-blocking):', err)
          );

          // Đọc route đích đã lưu trước khi redirect đến Keycloak
          const redirect = sessionStorage.getItem('authRedirect');
          if (redirect && redirect !== APP_ROUTES.LOGIN) {
            sessionStorage.removeItem('authRedirect');
            window.location.replace(redirect);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Keycloak init error:', err);
        _keycloakInitialized = false; // Cho phép thử lại nếu init thất bại
        setIsLoading(false);
      });

    // Auto-refresh token trước khi hết hạn 70 giây
    const interval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(70).then((refreshed) => {
          if (refreshed) setToken(keycloak.token ?? null);
        }).catch(() => keycloak.logout());
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const refreshUserState = () => {
    const roles: string[] = (keycloak.tokenParsed as any)?.realm_access?.roles ?? [];

    console.group('🔐 KEYCLOAK DATA DUMP');
    console.log('✅ Raw Token (JWT String):', keycloak.token);
    console.log('📄 Parsed Token (JSON Object):', keycloak.tokenParsed);
    console.log('👤 Username:', keycloak.tokenParsed?.preferred_username);
    console.log('📧 Email:', keycloak.tokenParsed?.email);
    console.log('🆔 User ID (sub):', keycloak.tokenParsed?.sub);
    console.log('🛡️ Roles (Realm):', roles);
    console.log('🏢 Resource Access (Client Roles):', keycloak.tokenParsed?.resource_access);
    console.log('⏰ Expired At:', keycloak.tokenParsed?.exp ? new Date(keycloak.tokenParsed.exp * 1000).toLocaleString() : 'N/A');
    console.groupEnd();

    setToken(keycloak.token ?? null);
    setUser({
      username: keycloak.tokenParsed?.preferred_username ?? 'unknown',
      email: keycloak.tokenParsed?.email,
      firstName: keycloak.tokenParsed?.given_name,
      lastName: keycloak.tokenParsed?.family_name,
      roles,
    });
  };

  const login = () => {
    keycloak.login({
      // BrowserRouter: redirect về đúng URL hiện tại sau khi đăng nhập
      redirectUri: window.location.origin + window.location.pathname,
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    keycloak.logout({
      redirectUri: window.location.origin + window.location.pathname,
    });
  };

  const hasRole = (role: string) => user?.roles.includes(role) ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!keycloak.authenticated,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
