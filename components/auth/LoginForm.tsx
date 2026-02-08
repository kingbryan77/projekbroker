
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../services/authService';
import AuthTabs from './AuthTabs';

const LoginForm: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; api?: string }>({});
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!identifier) newErrors.identifier = 'Username or Email is required.';
    if (!password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login(identifier, password); 
    if (success) {
      // Cek apakah user adalah admin untuk redirect yang sesuai
      const currentUser = await getCurrentUser();
      if (currentUser?.isAdmin) {
          navigate('/admin');
      } else {
          navigate('/');
      }
    } else {
      setErrors(prev => ({ ...prev, api: error || 'Login failed. Please try again.' }));
    }
  };

  return (
    <div className="flex flex-col">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-2 relative">
           {/* Menggunakan File Logo Lokal dari folder public dengan path absolute */}
           <img 
            src="/logo-28.png" 
            alt="FOREXimf Logo" 
            className="w-full h-full object-contain drop-shadow-lg filter brightness-110"
          />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">FOREX<span className="text-primary">imf</span></h1>
        <p className="text-gray-400 text-[10px] tracking-[0.3em] font-bold uppercase mt-1">TRADING LIKE A PRO</p>
      </div>

      {/* Tabs */}
      <AuthTabs />

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <h2 className="text-gray-300 text-sm font-medium mb-1 text-center">Login into your account</h2>

        {errors.api && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded text-sm text-center border border-red-500/30">
            {errors.api}
            </div>
        )}

        <div className="space-y-4">
            <div>
                <input
                    type="text"
                    placeholder="Username / Email"
                    className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}
            </div>

            <div>
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
        </div>

        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
                <input 
                    id="keepLoggedIn" 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-primary focus:ring-primary"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                />
                <label htmlFor="keepLoggedIn" className="ml-2 text-xs text-gray-400 cursor-pointer select-none">Keep me logged in</label>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all duration-200 mt-6 active:scale-95 uppercase tracking-wide text-sm"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
