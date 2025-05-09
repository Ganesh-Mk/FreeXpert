import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../store/userSlice.js";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, X } from "lucide-react";
import axios from "axios";
import OtpSendEmail from "../utils/otpSendingEmail.js";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Brute force protection states
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Forgot password states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otpNumber, setOtpNumber] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Load login attempts from localStorage
    const storedAttempts = localStorage.getItem("loginAttempts");
    const storedLockoutTime = localStorage.getItem("lockoutEndTime");

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    if (storedLockoutTime) {
      const lockoutTime = parseInt(storedLockoutTime);
      if (lockoutTime > Date.now()) {
        setIsLocked(true);
        setLockoutEndTime(lockoutTime);
      } else {
        // Clear expired lockout
        localStorage.removeItem("lockoutEndTime");
        localStorage.removeItem("loginAttempts");
      }
    }
  }, []);

  // Handle Google Sign-In response

  // Timer effect for countdown
  useEffect(() => {
    let interval;
    if (isLocked && lockoutEndTime) {
      interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.ceil((lockoutEndTime - Date.now()) / 1000)
        );
        setTimeRemaining(remaining);

        if (remaining === 0) {
          setIsLocked(false);
          setLoginAttempts(0);
          localStorage.removeItem("lockoutEndTime");
          localStorage.removeItem("loginAttempts");
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockoutEndTime]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    // Check if account is locked
    if (isLocked) {
      setLoginError(
        `Too many failed attempts. Please wait ${formatTime(
          timeRemaining
        )} before trying again.`
      );
      return;
    }

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post(`${BACKEND_URL}/login`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          // Reset login attempts on successful login
          setLoginAttempts(0);
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("lockoutEndTime");

          // Store user data and token
          const userData = response.data.user;
          const token = response.data.token;

          dispatch(login(userData));
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("token", token); // Store JWT token

          // Set default axios authorization header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to login. Please try again.";
        setLoginError(errorMessage);

        // Increment login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem("loginAttempts", newAttempts.toString());

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockoutDuration = getLockoutDuration(newAttempts);
          const endTime = Date.now() + lockoutDuration;
          setIsLocked(true);
          setLockoutEndTime(endTime);
          localStorage.setItem("lockoutEndTime", endTime.toString());
          setLoginError(
            `Too many failed attempts. Account locked for ${formatTime(
              lockoutDuration / 1000
            )}.`
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    window.open(`${BACKEND_URL}/auth/google`, "_self");
    localStorage.setItem("isLogin", true);
    dispatch(login());
  };


  // Calculate lockout duration based on number of attempts
  const getLockoutDuration = (attempts) => {
    if (attempts >= 10) {
      return 30 * 60 * 1000; // 30 minutes
    } else if (attempts >= 8) {
      return 15 * 60 * 1000; // 15 minutes
    } else if (attempts >= 6) {
      return 5 * 60 * 1000; // 5 minutes
    } else {
      return 1 * 60 * 1000; // 1 minute
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (!isLocked) {
      setLoginError("");
    }
  };

  // Generate random 4-digit OTP
  const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpNumber(otp);
    return otp;
  };

  // Handle forgot password email submission
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!forgotEmail) {
      setForgotEmailError("Email is required");
      return;
    }

    if (!emailRegex.test(forgotEmail)) {
      setForgotEmailError("Please enter a valid email");
      return;
    }

    setForgotEmailError("");
    const otp = generateOTP();

    const templateParams = {
      to_email: forgotEmail,
      otpnumber: otp,
    };

    try {
      await OtpSendEmail(templateParams);
      console.log("Email sent successfully!");
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    setIsEmailSent(true);
  };

  // Handle OTP verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();

    if (!userOtp) {
      setOtpError("Please enter the OTP");
      return;
    }

    if (userOtp !== otpNumber) {
      setOtpError("Invalid OTP. Please try again.");
      return;
    }

    setOtpError("");
    setIsOtpVerified(true);
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setNewPasswordError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      return;
    }

    setNewPasswordError("");
    setIsResetting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/resetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setResetSuccess(true);

      // Reset login attempts when password is reset successfully
      setLoginAttempts(0);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lockoutEndTime");
      setIsLocked(false);

      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotEmail("");
        setUserOtp("");
        setNewPassword("");
        setIsEmailSent(false);
        setIsOtpVerified(false);
        setResetSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setNewPasswordError(
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsResetting(false);
    }
  };

  const resetForgotPasswordState = () => {
    setForgotEmail("");
    setForgotEmailError("");
    setIsEmailSent(false);
    setOtpNumber("");
    setUserOtp("");
    setOtpError("");
    setIsOtpVerified(false);
    setNewPassword("");
    setNewPasswordError("");
    setResetSuccess(false);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    resetForgotPasswordState();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Binary Rain Animation */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="binary-rain"
              style={{
                left: `${i * 5}%`,
                animationDelay: `${i * 0.3}s`,
                color: "#0066cc",
              }}
            >
              01001010
            </div>
          ))}
        </div>

        {/* Floating Security Icons */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="security-icon"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 1.5}s`,
              }}
            >
              🔒
            </div>
          ))}
        </div>

        {/* Glowing Circuit Lines */}
        <div className="absolute inset-0">
          <svg className="w-full h-full opacity-5">
            <pattern
              id="circuit"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 50 L 100 50 M 50 0 L 50 100"
                stroke="#0066cc"
                strokeWidth="0.5"
              />
              <circle cx="50" cy="50" r="3" fill="#0066cc" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-md w-full space-y-4 bg-white p-8 mt-10 rounded-xl shadow-lg backdrop-blur-sm relative z-10 border border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔐</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-cyan-600">
            Login to continue your learning journey
          </p>
        </div>

        {isLocked && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Account temporarily locked</p>
            <p className="text-xs mt-1">
              Too many failed login attempts. Please wait{" "}
              {formatTime(timeRemaining)} or reset your password.
            </p>
            <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-full transition-all duration-1000"
                style={{
                  width: `${(timeRemaining /
                      (lockoutEndTime - Date.now() + timeRemaining * 1000)) *
                    100
                    }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginError && !isLocked && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {loginError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 transition-all"
                placeholder="you@example.com"
                disabled={isLocked}
              />
              {errors.email && (
                <p className="mt-1 text-red-600 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 transition-all pr-12"
                  placeholder="••••••••"
                  disabled={isLocked}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-600 text-sm">{errors.password}</p>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Signing In..."
                : isLocked
                  ? "Login Disabled"
                  : "Sign In"}
            </button>
          </div>
          {/* Google Login Button */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              "Connecting..."
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
                Sign in with Google
              </>
            )}
          </button>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-cyan-600 hover:text-cyan-800"
            >
              Forgot password?
            </button>

            <a href="/signup" className="text-cyan-600 hover:text-cyan-800">
              Don't have an account? Sign up
            </a>
          </div>
        </form>

        {loginAttempts > 0 && loginAttempts < 5 && (
          <div className="text-xs text-amber-600 text-center mt-2">
            Failed attempts: {loginAttempts}/5 before temporary lockout
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative border border-gray-200">
            <button
              onClick={closeForgotPasswordModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-xl font-bold text-gray-800">
                {resetSuccess
                  ? "Password Reset Successfully!"
                  : isOtpVerified
                    ? "Set New Password"
                    : isEmailSent
                      ? "Enter OTP"
                      : "Forgot Password"}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {resetSuccess
                  ? "You can now login with your new password"
                  : isOtpVerified
                    ? "Create a new secure password"
                    : isEmailSent
                      ? "Enter the 4-digit code sent to your email"
                      : "Enter your email to reset the code"}
              </p>
            </div>

            {!resetSuccess && (
              <>
                {!isEmailSent ? (
                  <form
                    onSubmit={handleForgotEmailSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="forgotEmail" className="text-gray-700">
                        Email address
                      </label>
                      <input
                        id="forgotEmail"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotEmailError("");
                        }}
                        className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 transition-all"
                        placeholder="you@example.com"
                      />
                      {forgotEmailError && (
                        <p className="mt-1 text-red-600 text-sm">
                          {forgotEmailError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                    >
                      Send OTP
                    </button>
                  </form>
                ) : !isOtpVerified ? (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label htmlFor="otp" className="text-gray-700">
                        Enter 4-digit OTP
                      </label>
                      <div className="mt-2 flex justify-center gap-2">
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
                          className="block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 text-center text-xl tracking-widest"
                          placeholder="Enter OTP"
                        />
                      </div>
                      {otpError && (
                        <p className="mt-1 text-red-600 text-sm text-center">
                          {otpError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                    >
                      Verify OTP
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          generateOTP();
                          console.log(`New OTP generated: ${otpNumber}`);
                        }}
                        className="text-cyan-600 hover:text-cyan-800 text-sm"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setNewPasswordError("");
                          }}
                          className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-cyan-500 focus:bg-white focus:ring-0 text-gray-800 transition-all pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {newPasswordError && (
                        <p className="mt-1 text-red-600 text-sm">
                          {newPasswordError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isResetting}
                      className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResetting ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </>
            )}

            {resetSuccess && (
              <div className="mt-4">
                <button
                  onClick={closeForgotPasswordModal}
                  className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .binary-rain {
          position: absolute;
          top: -20px;
          font-family: monospace;
          animation: rain 15s linear infinite;
          opacity: 0.5;
        }

        @keyframes rain {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        .security-icon {
          position: absolute;
          font-size: 24px;
          animation: float 10s ease-in-out infinite;
          opacity: 0.3;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
