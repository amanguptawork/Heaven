import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { checkEmail } from "../../../api/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { handleGoogleLogin } from "../../../utils/googleAuth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../../contexts/AuthContext";
import axiosInstance from "../../../api/axios";

export const StepOne = ({ onNext }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Check if authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      // First decode the credential to get the email
      const decodedToken = jwtDecode(credentialResponse.credential);
      const email = decodedToken.email;

      // Check if this email is already registered
      try {
        const emailCheckResult = await checkEmail({ email });

        if (emailCheckResult.exists) {
          // User already exists - log them in directly
          const data = await handleGoogleLogin(credentialResponse);

          // Store authentication data
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(data.user));

          // Update global user state - this is the key addition
          setUser(data.user);
          toast.dismiss();
          toast.success("Welcome back!");
          navigate("/dashboard");
        } else {
          // New user - continue with registration flow
          const data = await handleGoogleLogin(credentialResponse);
          // Proceed to step 2 with pre-filled data
          onNext({
            email: data.user.email,
            fullName: data.user.fullName,
            isGoogleLogin: true, // Flag to hide password field in Step 2
          });
        }
      } catch (error) {
        toast.error(
          "Error checking email: " +
            (error.response?.data?.message || error.message)
        );
      }
    } catch (error) {
      toast.error("Google login failed: " + error.message);
    }
  };

  // Modified emailCheckMutation
  const emailCheckMutation = useMutation({
    mutationFn: checkEmail,
    onSuccess: (data) => {
      if (data.exists) {
        toast.error("Email already exists");
        return;
      }
      // Convert to lowercase after receiving data from the server
      onNext({ email: data.email.toLowerCase() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (formData) => {
    // Convert email to lowercase to ensure case-insensitive checks
    const emailLowerCased = formData.email.toLowerCase();
    emailCheckMutation.mutate({ email: emailLowerCased });
  };

  // Fetch random female users (kept as-is, not modified)
  const { data: femaleUsers, isLoading: loadingFemales } = useQuery({
    queryKey: ["reg-femaleUsers"],
    queryFn: () =>
      axiosInstance
        .get("/users", { params: { gender: "female", random: true } })
        .then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  // Fetch random male users (kept as-is, not modified)
  const { data: maleUsers, isLoading: loadingMales } = useQuery({
    queryKey: ["reg-maleUsers"],
    queryFn: () =>
      axiosInstance
        .get("/users", { params: { gender: "male", random: true } })
        .then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  // Combine male + female, duplicate female array for “more female”
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderUsers = useMemo(() => {
    if (!femaleUsers || !maleUsers) return [];
    let combined = [...femaleUsers, ...femaleUsers, ...maleUsers];
    combined.sort(() => 0.5 - Math.random());
    return combined;
  }, [femaleUsers, maleUsers]);

  // HONE images (just like the LoginForm)
  const honeImages = [
    "/images/HONE 1.jpg",
    "/images/HONE 2.jpg",
    "/images/HONE 3.jpg",
  ];

  // Rotate HONE images every ~6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % honeImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [honeImages]);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden justify-center md:justify-start">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-1/2 flex flex-col bg-gradient-to-b from-pink-50/30 to-white"
      >
        <div className="h-14 md:h-16 flex items-center pl-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6" />
            <img src="/honelogo.png" alt="HOEC Logo" className="h-[60px]" />
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[520px] px-8 md:pr-16">
            <h1 className="font-fraunces text-3xl md:text-[36px] font-light text-primary leading-[1.2] mb-8">
              Find your soulmate in faith. Start your journey today.
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Your email address
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary text-white font-inter font-bold text-base rounded-lg hover:bg-primary-dark transition-all duration-200"
              >
                {isLoading ? "Processing..." : "Continue"}
              </button>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="font-inter text-sm text-primary/50 font-medium">
                  or
                </span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>

              <div className="w-full google-button">
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
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Right Panel: use the same HONE images slideshow */}
      <div className="relative hidden md:block md:w-1/2 h-screen p-0 m-0 overflow-hidden">
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
