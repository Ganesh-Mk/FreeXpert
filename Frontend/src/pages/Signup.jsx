import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import OtpSendEmail from '../utils/otpSendingEmail.js';
import EmailVerify from '../utils/emailVerify.js';
import { login } from "../store/userSlice.js";
import { useDispatch } from "react-redux";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Step states to control the signup flow
  const [step, setStep] = useState(1); // 1: Email & Name form, 2: OTP verification, 3: Password & Role

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer" // Default role
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // OTP states
  const [otpNumber, setOtpNumber] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const roles = [
    { value: "user", label: "User" },
    { value: "developer", label: "Developer" },
  ];

  // Validate step 1 (name and email)
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 3 (password and role)
  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Generate random 4-digit OTP
  const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpNumber(otp);
    return otp;
  };

  // Handle send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (validateStep1()) {
      setIsSendingOtp(true);
      try {
        const otp = generateOTP();

        const templateParams = {
          to_email: formData.email,
          otpnumber: otp,
        };

        await EmailVerify(templateParams);
        // console.log("Email sent successfully with OTP:", otp);
        setStep(2); // Move to OTP verification step
      } catch (error) {
        console.error("Failed to send OTP email:", error);
        setServerError("Failed to send verification code. Please try again.");
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);

    if (!userOtp) {
      setOtpError("Please enter the OTP");
      setIsVerifyingOtp(false);
      return;
    }

    if (userOtp !== otpNumber) {
      setOtpError("Invalid OTP. Please try again.");
      setIsVerifyingOtp(false);
      return;
    }

    setOtpError("");
    setStep(3); // Move to password & role step
    setIsVerifyingOtp(false);
  };

  const handleGoogleSignup = () => {
    window.open(`${BACKEND_URL}/auth/google`, "_self");
    localStorage.setItem("isLogin", true);
    dispatch(login());
  };


  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const user = query.get('user');

    if (user) {
      const userData = JSON.parse(decodeURIComponent(user));
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userId", userData.id);
      dispatch(login(userData)); // if you use Redux
    }
  }, []);



  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (validateStep3()) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${BACKEND_URL}/signup`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          const userData = response.data.user;
          const token = response.data.token;

          dispatch(login(userData));
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('token', token);

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          navigate('/');
        }
      } catch (error) {
        console.error("Signup error:", error);
        setServerError(
          error.response?.data?.message ||
          "Failed to register. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render form based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1: // Name and Email step
        return (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-gray-700 block mb-1">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-white/90 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="text-gray-700 block mb-1">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-white/90 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingOtp ? 'Sending Verification Code...' : 'Verify Email'}
            </button>

            {/* Google Sign up button */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  'Connecting...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 2: // OTP verification step
        return (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  A verification code has been sent to <span className="text-cyan-600 font-medium">{formData.email}</span>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="text-gray-700 block mb-1">Enter 4-digit verification code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={4}
                  value={userOtp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setUserOtp(value);
                    setOtpError("");
                  }}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-white/90 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 text-center text-xl tracking-widest"
                  placeholder="Enter code"
                />
                {otpError && <p className="mt-1 text-red-500 text-sm text-center">{otpError}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifyingOtp ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Google Sign up button */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  'Connecting...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 3: // Password and Role step
        return (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="password" className="text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg bg-white/90 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            {/* Google Sign up button */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  'Connecting...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center mt-10 justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white/90 p-8 rounded-xl shadow-lg backdrop-blur-sm relative z-10">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🛡️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex gap-2 items-center justify-center">
            Join
            <span className="text-3xl font-bold">
              <span className="text-purple-600">Free</span>
              <span className="text-indigo-600">X</span>
              <span className="text-purple-600">pert</span>
            </span>
          </h2>
          <p className="text-cyan-600">Begin your freelance learning journey</p>

          {/* Step indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${step === stepNumber
                  ? 'bg-cyan-500'
                  : step > stepNumber
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {step === 1 && "Step 1: Basic Information"}
            {step === 2 && "Step 2: Email Verification"}
            {step === 3 && "Step 3: Complete Profile"}
          </p>
        </div>

        {serverError && (
          <div className="bg-red-100 border border-red-500 text-red-600 px-4 py-2 rounded-lg">
            {serverError}
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
};

export default Signup;