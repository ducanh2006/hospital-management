
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/common/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { APP_ROUTES } from './constants/config';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Organization from './pages/Organization';
import Booking from './pages/Booking';
import Doctors from './pages/Doctors';
import News from './pages/News';
import TestResults from './pages/TestResults';
import Login from './pages/Login';
import Admin from './pages/Admin';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to={APP_ROUTES.LOGIN} />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={APP_ROUTES.HOME} element={<MainLayout><Home /></MainLayout>} />
      <Route path={APP_ROUTES.ABOUT} element={<MainLayout><About /></MainLayout>} />
      <Route path={APP_ROUTES.ORG} element={<MainLayout><Organization /></MainLayout>} />
      <Route path={APP_ROUTES.BOOKING} element={<MainLayout><Booking /></MainLayout>} />
      <Route path={APP_ROUTES.DOCTORS} element={<MainLayout><Doctors /></MainLayout>} />
      <Route path={APP_ROUTES.NEWS} element={<MainLayout><News /></MainLayout>} />
      <Route path={APP_ROUTES.RESULTS} element={<MainLayout><TestResults /></MainLayout>} />
      <Route path={APP_ROUTES.LOGIN} element={<MainLayout><Login /></MainLayout>} />
      <Route 
        path={APP_ROUTES.ADMIN} 
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
