import React from 'react';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#0B0E11] overflow-hidden text-white p-4 font-sans">
      
      {/* Background Image - Local Asset */}
      <div className="absolute inset-0 z-0">
        <img 
            src="/background.png" 
            alt="Background" 
            className="w-full h-full object-cover opacity-80"
        />
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-black/40 to-black/80"></div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-lg bg-[#222222]/60 backdrop-blur-md rounded-[30px] shadow-2xl p-8 sm:p-10 border border-white/10 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;