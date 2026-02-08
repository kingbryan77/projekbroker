
import React, { useState } from 'react';
import AuthTabs from './AuthTabs';

const ForgotPasswordForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(username && email) {
        // Simulation of reset
        setIsSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-2 relative">
           <img src="/logo-28.png" alt="FOREXimf Logo" className="w-full h-full object-contain drop-shadow-lg filter brightness-110" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">FOREX<span className="text-primary">imf</span></h1>
        <p className="text-gray-400 text-[10px] tracking-[0.3em] font-bold uppercase mt-1">TRADING LIKE A PRO</p>
      </div>

      {/* Tabs */}
      <AuthTabs />

      {isSubmitted ? (
          <div className="text-center bg-green-500/10 p-6 rounded border border-green-500/30">
              <h3 className="text-green-500 font-bold mb-2">Request Submitted</h3>
              <p className="text-gray-300 text-sm">If an account matches your details, we have sent password reset instructions to <strong>{email}</strong>.</p>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-gray-300 text-sm font-medium mb-1 text-center">Reset Your Password</h2>
            
            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all duration-200 mt-4 active:scale-95 uppercase tracking-wide text-sm"
            >
            Reset Password
            </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
