import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';

import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import DashboardContent from './components/dashboard/DashboardContent';
import AdminPanel from './components/admin/AdminPanel';
import TradePage from './components/pages/TradePage';
import InvestmentPage from './components/pages/InvestmentPage';
import KycPage from './components/pages/KycPage';
import SecurityPage from './components/pages/SecurityPage';
import SettingPage from './components/pages/SettingPage';
import FaqPage from './components/pages/FaqPage';

// Wallet Components
import WalletBalance from './components/wallet/WalletBalance';
import WalletDeposit from './components/wallet/WalletDeposit';
import WalletWithdrawal from './components/wallet/WalletWithdrawal';
import WalletTransfer from './components/wallet/WalletTransfer';

const AppRoutes: React.FC = () => {
  const { status, user } = useAuth();

  // 1. Loading State
  if (status === 'LOADING') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E11] text-white">
        <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-sm font-medium tracking-wider">LOADING SYSTEM...</div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Routes (Login/Register)
  if (status === 'UNAUTHENTICATED') {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthLayout>
    );
  }

  // 3. ADMIN ROUTES (STRICT SEPARATION)
  // Jika user adalah ADMIN, dia HANYA bisa mengakses AdminPanel.
  // DashboardLayout User TIDAK AKAN DI-RENDER.
  if (user?.isAdmin) {
      return (
        <Routes>
            <Route path="/admin" element={<AdminPanel />} />
            {/* Redirect root atau rute acak lainnya ke /admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      );
  }

  // 4. USER ROUTES (STANDARD TRADING DASHBOARD)
  // Hanya dirender jika user BUKAN admin.
  return (
    <DashboardLayout>
        <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/trade" element={<TradePage />} />
            
            {/* Wallet Routes */}
            <Route path="/wallet" element={<Navigate to="/wallet/balance" replace />} />
            <Route path="/wallet/balance" element={<WalletBalance />} />
            <Route path="/wallet/add-balance" element={<WalletDeposit />} />
            <Route path="/wallet/transfer" element={<WalletTransfer />} />
            <Route path="/wallet/withdrawal" element={<WalletWithdrawal />} />
            
            <Route path="/investment" element={<InvestmentPage />} />
            <Route path="/kyc" element={<KycPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="/faq" element={<FaqPage />} />
            
            {/* Jika User Biasa mencoba akses /admin, tendang ke home */}
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </DashboardLayout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <TransactionProvider>
          <AppRoutes />
        </TransactionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;