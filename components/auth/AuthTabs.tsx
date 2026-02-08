import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthTabs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getButtonClass = (isActive: boolean) => {
    return isActive
      ? "bg-[#F97316] text-white font-bold shadow-lg transform scale-105"
      : "bg-[#F97316]/80 text-white/80 hover:bg-[#F97316] hover:text-white";
  };

  return (
    <div className="flex space-x-1 sm:space-x-2 justify-center mb-8">
      <Link 
        to="/" 
        className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm transition-all duration-200 ${getButtonClass(path === '/')}`}
      >
        Login
      </Link>
      <Link 
        to="/register" 
        className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm transition-all duration-200 ${getButtonClass(path === '/register')}`}
      >
        Register
      </Link>
      <Link 
        to="/forgot-password" 
        className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm transition-all duration-200 ${getButtonClass(path === '/forgot-password')}`}
      >
        Forgot Password
      </Link>
    </div>
  );
};

export default AuthTabs;