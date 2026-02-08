
import React from 'react';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#0B0E11] overflow-hidden text-white p-4 font-sans">
      
      {/* Background Video - Using Absolute Path from Root Public Folder */}
      <div className="absolute inset-0 z-0">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-60"
        >
            <source src="/background.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/80 via-[#0B0E11]/60 to-[#0B0E11]/90"></div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-lg bg-[#151922]/80 backdrop-blur-xl rounded-[30px] shadow-2xl p-8 sm:p-10 border border-white/5 relative z-10 animate-fade-in-up">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
