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
           <img src="/logo.png" alt="FOREXimf Logo" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">FOREXimf</h1>
        <p className="text-gray-400 text-[10px] tracking-[0.2em] font-medium uppercase">TRADING LIKE A PRO</p>
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
            <h2 className="text-white text-sm font-medium mb-1">Reset Your Password</h2>
            
            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full bg-transparent border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-colors"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-transparent border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button
            type="submit"
            className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded shadow-lg transition duration-200 mt-4"
            >
            Reset Password
            </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;