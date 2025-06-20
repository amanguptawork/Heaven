// Replace this portion in your LoginForm component.

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { checkEmail } from "../../api/auth";
import { login } from "../../api/auth";
import { handleGoogleLogin } from "../../utils/googleAuth";
import { useRegisterStore } from "../../store/registerStore";
import { useAuth } from "../../contexts/AuthContext";

const honeImages = [
  "/images/HONE 1.jpg", // rename your file to HONE-1.jpg
  "/images/HONE 2.jpg", // rename your file to HONE-2.jpg
  "/images/HONE 3.jpg", // rename your file to HONE-3.jpg
];

export const LoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const setRegisterData = useRegisterStore((state) => state.setFormData);
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % honeImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Check if user is already authenticated, or pre-fill from remembered credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRemember = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedPassword && savedRemember) {
      setValue("email", savedEmail);
      setValue("password", savedPassword);
      setRememberMe(true);
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, setValue]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("userData", JSON.stringify(data.user));
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const decodedToken = jwtDecode(credentialResponse.credential);
      const email = decodedToken.email;
      const fullName = decodedToken.name || "";
      const emailCheckResult = await checkEmail({ email });

      if (!emailCheckResult.exists) {
        setRegisterData({
          email,
          fullName,
          isGoogleLogin: true,
        });
        toast.success("Please complete your registration");
        navigate("/register");
      } else {
        const data = await handleGoogleLogin(credentialResponse);

        if (data.isNewUser) {
          localStorage.setItem("googleUserEmail", data.user.email);
          localStorage.setItem("googleUserFullName", data.user.fullName);

          navigate("/register");
        } else {
          setUser(data.user);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast.error(error.message || "Google login failed");
    }
  };

  const onSubmit = async (formData) => {
    const userData = {
      ...formData,
      email: formData.email.toLowerCase(),
    };

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", userData.email);
      localStorage.setItem("rememberedPassword", userData.password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    }

    try {
      await loginMutation.mutateAsync(userData);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden justify-center md:justify-start">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-1/2 flex flex-col bg-gradient-to-b from-pink-50/30 to-white"
      >
        {/* Logo area with reduced gap */}
        <div className="h-14 md:h-16 flex items-center pl-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6"></div>
            <img src="/honelogo.png" alt="HOEC Logo" className="h-[60px]" />
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[520px] px-8 md:pr-16">
            <h1 className="font-fraunces text-3xl md:text-[36px] font-light text-primary leading-[1.2] mb-8">
              Welcome back to your journey of faith and love.
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full h-12 px-4 border-2 border-primary rounded-lg font-inter text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <span className="absolute -bottom-5 left-0 text-red-500 text-sm">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="w-full h-12 px-4 border-2 border-primary rounded-lg font-inter text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                  {errors.password && (
                    <span className="absolute -bottom-5 left-0 text-red-500 text-sm">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="ml-2 text-sm text-primary">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginMutation.isLoading}
                className="w-full h-12 bg-primary text-white font-inter font-bold text-base rounded-lg hover:bg-primary-dark transition-all duration-200"
              >
                {loginMutation.isLoading ? "Signing in..." : "Sign In"}
              </button>

              {/* Google Login */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="font-inter text-sm text-primary/50 font-medium">
                  or
                </span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>

              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => toast.error("Google login failed")}
                  theme="outline"
                  size="large"
                  width={520}
                  text="continue_with"
                  useOneTap={false}
                  cookiePolicy="single_host_origin"
                  popupType="popup"
                  className="!w-full"
                  containerProps={{
                    style: { width: "100%", display: "block" },
                  }}
                />
              </GoogleOAuthProvider>
            </form>

            <p className="mt-8 text-center text-sm text-primary">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-primary font-bold hover:underline"
              >
                CREATE ONE NOW
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Panel: Slideshow of the three HONE images */}
      <div className="relative hidden md:block md:w-1/2 overflow-hidden">
        <AnimatePresence mode="wait">
          {honeImages.map((img, index) =>
            index === currentIndex ? (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-full h-full"
              >
                <img
                  src={img}
                  alt={`HONE Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
