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
           <img 
            src="/logo.png" 
            alt="FOREXimf Logo" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">FOREXimf</h1>
        <p className="text-gray-400 text-[10px] tracking-[0.2em] font-medium uppercase">TRADING LIKE A PRO</p>
      </div>

      {/* Tabs */}
      <AuthTabs />

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <h2 className="text-white text-sm font-medium mb-1">Login into your account</h2>

        {errors.api && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded text-sm text-center border border-red-500/30">
            {errors.api}
            </div>
        )}

        <div className="space-y-4">
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full bg-transparent border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-colors"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}
            </div>

            <div>
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-transparent border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
        </div>

        <div className="flex items-center">
            <input 
                id="keepLoggedIn" 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-600 bg-transparent text-[#F97316] focus:ring-[#F97316]"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
            />
            <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-400">Keep me logged in</label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded shadow-lg transition duration-200 mt-4"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;