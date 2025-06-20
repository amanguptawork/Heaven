import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiCalendar } from "react-icons/fi";
import { useRegisterStore } from "../../../store/registerStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";

export const StepTwo = ({ onNext, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formData = useRegisterStore((state) => state.formData);
  const [birthDate, setBirthDate] = useState(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: formData.fullName || "",
      dateOfBirth: formData.dateOfBirth || "",
      gender: formData.gender || "",
      password: formData.password || "",
    },
  });

  const onSubmit = (data) => {
    onNext(data);
  };

  const handleBack = () => {
    onBack();
  };

  // Make a separate array for HONE images
  const honeImages = [
    "/images/HONE 1.jpg",
    "/images/HONE 2.jpg",
    "/images/HONE 3.jpg",
  ];

  // Slideshow index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate through the honeImages array every ~6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % honeImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [honeImages]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden justify-center md:justify-start">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex flex-col bg-gradient-to-b from-pink-50/30 to-white">
        <div className="h-16 md:h-20 flex items-center pl-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6"></div>
            <img src="/honelogo.png" alt="HOEC Logo" className="h-[73px]" />
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[520px] pl-8 pr-8 md:pr-16">
            <h1 className="font-fraunces text-4xl md:text-[46px] font-light text-primary leading-[1.2] mb-12">
              Tell us about yourself
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                  className="w-full h-12 px-4 border-2 border-primary rounded-lg
                             font-inter text-base placeholder-gray-500
                             focus:outline-none focus:ring-2
                             focus:ring-primary transition-all duration-200"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <span className="text-red-500 text-sm">
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Date of Birth
                </label>
                <div className="relative">
                  <DatePicker
                    selected={birthDate}
                    onChange={(date) => {
                      setBirthDate(date);
                      setValue("dateOfBirth", date.toISOString().split("T")[0]);
                    }}
                    dateFormat="MMMM d, yyyy"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    placeholderText="Select your birth date"
                    maxDate={new Date()}
                    wrapperClassName="w-full"
                    className="w-full h-12 px-4 border-2 border-primary rounded-lg
                               font-inter text-base focus:outline-none focus:ring-2
                               focus:ring-primary transition-all duration-200"
                    popperClassName="react-datepicker-right"
                    customInput={
                      <input
                        {...register("dateOfBirth", {
                          required: "Date of birth is required",
                          validate: (value) => {
                            const age =
                              new Date().getFullYear() -
                              new Date(value).getFullYear();
                            return (
                              age >= 18 || "You must be at least 18 years old"
                            );
                          },
                        })}
                        className="w-full h-12 px-4 pr-12 border-2 border-primary rounded-lg
                                   font-inter text-base focus:outline-none focus:ring-2
                                   focus:ring-primary transition-all duration-200"
                        placeholder="Select your birth date"
                      />
                    }
                  />
                  <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                </div>
                {errors.dateOfBirth && (
                  <span className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Gender
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 relative">
                    <input
                      type="radio"
                      value="male"
                      {...register("gender", {
                        required: "Please select your gender",
                      })}
                      className="absolute opacity-0"
                    />
                    <div
                      className={`w-full h-12 flex items-center justify-center border-2 rounded-lg
                                  cursor-pointer transition-all duration-200
                                  ${
                                    watch("gender") === "male"
                                      ? "border-primary bg-primary text-white"
                                      : "border-primary text-primary hover:bg-primary/5"
                                  }`}
                    >
                      Male
                    </div>
                  </label>

                  <label className="flex-1 relative">
                    <input
                      type="radio"
                      value="female"
                      {...register("gender", {
                        required: "Please select your gender",
                      })}
                      className="absolute opacity-0"
                    />
                    <div
                      className={`w-full h-12 flex items-center justify-center border-2 rounded-lg
                                  cursor-pointer transition-all duration-200
                                  ${
                                    watch("gender") === "female"
                                      ? "border-primary bg-primary text-white"
                                      : "border-primary text-primary hover:bg-primary/5"
                                  }`}
                    >
                      Female
                    </div>
                  </label>
                </div>
                {errors.gender && (
                  <span className="text-red-500 text-sm">
                    {errors.gender.message}
                  </span>
                )}
              </div>

              {/* Password (hidden if Google login) */}
              {!formData.isGoogleLogin && (
                <div className="space-y-2">
                  <label className="block font-inter text-base text-primary">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: !formData.isGoogleLogin
                          ? "Password is required"
                          : false,
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className="w-full h-12 px-4 border-2 border-primary rounded-lg
                                 font-inter text-base placeholder-gray-500
                                 focus:outline-none focus:ring-2
                                 focus:ring-primary transition-all duration-200 pr-12"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary"
                    >
                      {showPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-sm">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/2 h-12 border-2 border-primary text-primary font-inter font-bold
                             rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 h-12 bg-primary text-white font-inter font-bold
                             rounded-lg hover:bg-primary-dark transition-all duration-200"
                >
                  {isLoading ? "Processing..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel: now using the same HONE images slideshow as in LoginForm */}
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
