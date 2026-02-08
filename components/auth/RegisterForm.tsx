
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import AuthTabs from './AuthTabs';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const RegisterForm: React.FC = () => {
  // Fields based on screenshot
  const [sponsor, setSponsor] = useState('AFIF FATHONY (ID: aswpprasetyo)'); // Defaulting based on screenshot visual
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('Singapore'); // Visual purpose
  const [countryCode, setCountryCode] = useState('65'); // Singapore Code
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [needsVerification, setNeedsVerification] = useState(false);

  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'Full Name is required.';
    if (!email) newErrors.email = 'Email Address is required.';
    if (!username) newErrors.username = 'Username is required.';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone Number is required.';
    if (!password) newErrors.password = 'Password is required.';
    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Conditions.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Combine country code for backend logic
    const fullPhone = `+${countryCode}${phoneNumber}`;

    const userData: any = {
      fullName,
      email,
      username,
      phoneNumber: fullPhone,
      password,
      // sponsorId: sponsor (if backend supported it)
    };

    const success = await register(userData);
    if (success) {
      setNeedsVerification(true);
    }
  };

  if (needsVerification) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 mb-4">
           <InformationCircleIcon className="w-full h-full text-[#F97316]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
        <p className="text-gray-300 mb-6">
             Please check your email inbox <strong>({email})</strong> to verify your account.
        </p>
        <button onClick={() => navigate('/')} className="text-[#F97316] font-bold hover:underline">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 mb-2 relative">
           <img src="/logo-28.png" alt="FOREXimf Logo" className="w-full h-full object-contain drop-shadow-lg filter brightness-110" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">FOREX<span className="text-primary">imf</span></h1>
        <p className="text-gray-400 text-[9px] tracking-[0.3em] font-bold uppercase mt-1">TRADING LIKE A PRO</p>
      </div>

      {/* Tabs */}
      <AuthTabs />

      <h2 className="text-gray-300 text-sm font-medium mb-4 text-center">Register New Member</h2>

      {(errors.api || error) && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded text-sm mb-4 text-center border border-red-500/30">
          {errors.api || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Sponsor Field */}
        <div>
            <label className="block text-xs text-gray-500 mb-1">Sponsor</label>
            <input
                type="text"
                value={sponsor}
                readOnly
                className="w-full bg-[#0B0E11]/30 border border-gray-600 rounded px-3 py-2 text-gray-400 text-sm focus:outline-none cursor-not-allowed opacity-70"
            />
        </div>

        {/* Name Field */}
        <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
                type="text"
                placeholder="Enter Full Name"
                className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-0.5">{errors.fullName}</p>}
        </div>

        {/* Country & Phone */}
        <div>
            <label className="block text-xs text-gray-500 mb-1">Country | Phone Number</label>
            <div className="flex space-x-2">
                <div className="w-1/3 relative">
                     <select 
                        className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded px-2 py-2 text-white text-sm appearance-none focus:outline-none focus:border-[#F97316]"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                     >
                         <option value="Singapore" className="bg-[#222]">Singapore</option>
                         <option value="Indonesia" className="bg-[#222]">Indonesia</option>
                         <option value="Malaysia" className="bg-[#222]">Malaysia</option>
                     </select>
                </div>
                <div className="w-2/3 flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-600 rounded-l text-gray-400 text-sm bg-white/5">
                        {country === 'Indonesia' ? '🇮🇩 +62' : country === 'Malaysia' ? '🇲🇾 +60' : '🇸🇬 +65'}
                    </span>
                    <input
                        type="text"
                        placeholder="8123 4567"
                        className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded-r px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
            </div>
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-0.5">{errors.phoneNumber}</p>}
        </div>

        {/* Email Address */}
        <div>
            <label className="block text-xs text-gray-500 mb-1">Email Address</label>
            <input
                type="email"
                placeholder="Enter Email Address"
                className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
        </div>

        {/* Username */}
        <div>
            <label className="block text-xs text-gray-500 mb-1">Username</label>
            <input
                type="text"
                placeholder="Enter Username"
                className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="text-xs text-red-500 mt-0.5">{errors.username}</p>}
        </div>

        {/* Password */}
        <div>
            <label className="block text-xs text-gray-500 mb-1">Password</label>
            <input
                type="password"
                placeholder="Enter Password"
                className="w-full bg-[#0B0E11]/50 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-center pt-2">
            <input 
                id="agreeTerms"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-600 bg-transparent text-[#F97316] focus:ring-[#F97316]"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="agreeTerms" className="ml-2 text-xs text-gray-400">
                I agree <span className="text-[#F97316] cursor-pointer hover:underline">Terms and Conditions</span>
            </label>
        </div>
        {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all duration-200 mt-4 active:scale-95 uppercase tracking-wide text-sm"
        >
          {isLoading ? 'Processing...' : 'Signup Now'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
