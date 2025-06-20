import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { sendVerificationEmail, verifyOTP } from '../../../api/auth';

// 1) Import AuthContext or useAuth
import { useAuth } from '../../../contexts/AuthContext';

export const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  // 2) Destructure setUser from our AuthContext
  const { setUser } = useAuth();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      const lastInput = document.querySelector(`input[name=otp-5]`);
      lastInput?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      prevInput?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      const email = localStorage.getItem('verificationEmail');
      await sendVerificationEmail({ email });
      setTimeLeft(90);
      toast.dismiss();
      toast.success('New OTP sent successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.dismiss();
      toast.error('Please enter complete OTP');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await verifyOTP(otpString);

      if (response.success) {
        // 3) Store token and user in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // 4) Immediately update the App-level user state so the UI knows
        setUser(response.user);
        toast.dismiss();
        toast.success('Email verified successfully');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.dismiss();
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50/30 to-white px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="font-fraunces text-3xl font-light text-primary mb-2">
            Verify your email
          </h2>
          <p className="text-gray-600">
            We've sent a verification code to your email
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                name={`otp-${index}`}
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-10 md:w-12 h-10 md:h-12 text-center md:text-xl text-sm  font-bold border-2 border-primary rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={handleResendOTP}
              disabled={timeLeft > 0 || isResending}
              className="flex items-center text-primary hover:text-primary-dark disabled:opacity-50
                         transition-colors duration-200"
            >
              <FiRefreshCw className={`mr-2 ${isResending ? 'animate-spin' : ''}`} />
              Resend OTP
            </button>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full h-12 bg-primary text-white font-inter font-bold rounded-lg
                         hover:bg-primary-dark transition-all duration-200 flex items-center justify-center"
          >
            {isVerifying ? (
              'Verifying...'
            ) : (
              <>
                Verify Email
                <FiArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
