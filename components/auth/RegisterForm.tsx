import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AuthStatus } from '../../types';
import { EnvelopeIcon, LockClosedIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register, verifyEmail, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'Full Name is required.';
    if (!email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid.';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone Number is required.';
    else if (!/^\d+$/.test(phoneNumber)) newErrors.phoneNumber = 'Phone Number must be numeric.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms & Conditions.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // `username` is no longer needed here as it's generated from the email in authService
    const userData: Omit<User, 'id' | 'username' | 'isAdmin' | 'isVerified' | 'balance' | 'notifications' | 'profilePictureUrl'> & { password: string } = {
      fullName,
      email,
      phoneNumber,
      password,
    };

    const success = await register(userData);
    if (success) {
      // For this simulation, we will auto-verify the user to allow login.
      await verifyEmail(email); 
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/'); // Redirect to login after a short delay
      }, 3000);
    } else {
      setErrors(prev => ({ ...prev, api: error || 'Registration failed. Please try again.' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold tracking-wide text-white">
          FOREX<span className="text-blue-500">imf</span>
        </h1>
        <p className="text-gray-300 mt-1 text-xs tracking-wider">TRADING LIKE A PRO</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Create Your Account</h2>
      <p className="text-gray-400 mb-6">Start trading with confidence</p>

      {errors.api && (
        <div className="bg-danger/20 text-danger p-3 rounded-md mb-4 text-sm">
          {errors.api}
        </div>
      )}
      {registrationSuccess && (
        <div className="bg-success/20 text-success p-3 rounded-md mb-4 text-sm">
          Registration successful! Your account is now active. Redirecting to login...
        </div>
      )}

      <Input
        id="fullName"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        icon={<UserIcon />}
        value={fullName}
        onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: undefined })); }}
        error={errors.fullName}
      />
      <Input
        id="email"
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        icon={<EnvelopeIcon />}
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
        error={errors.email}
      />
      <Input
        id="phoneNumber"
        label="Phone Number"
        type="tel"
        placeholder="Enter your phone number"
        icon={<PhoneIcon />}
        value={phoneNumber}
        onChange={(e) => { setPhoneNumber(e.target.value); setErrors(prev => ({ ...prev, phoneNumber: undefined })); }}
        error={errors.phoneNumber}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={<LockClosedIcon />}
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined, confirmPassword: undefined })); }}
        error={errors.password}
      />
      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        icon={<LockClosedIcon />}
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
        error={errors.confirmPassword}
      />

      <div className="flex items-center mb-6 text-sm">
        <input
          id="agreeTerms"
          type="checkbox"
          className="form-checkbox h-4 w-4 text-primary bg-darkblue2 border-gray-700 rounded focus:ring-primary"
          checked={agreeTerms}
          onChange={(e) => { setAgreeTerms(e.target.checked); setErrors(prev => ({ ...prev, agreeTerms: undefined })); }}
        />
        <label htmlFor="agreeTerms" className="ml-2 text-gray-400">
          I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a>
        </label>
        {errors.agreeTerms && <p className="ml-2 text-sm text-danger">{errors.agreeTerms}</p>}
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading}>
        Register
      </Button>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-700" />
        <span className="px-3 text-gray-500 text-sm">OR</span>
        <hr className="flex-grow border-gray-700" />
      </div>

      <p className="text-gray-400 text-sm">
        Already have an account?{' '}
        <Link to="/" className="text-primary hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;