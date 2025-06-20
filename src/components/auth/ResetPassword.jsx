import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { resetPassword } from "../../api/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => resetPassword({ token, password: data.password }),
    onSuccess: () => {
      toast.dismiss();
      toast.success("Password reset successful");
      navigate("/login");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Password reset failed");
    },
  });

  const onSubmit = (data) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8"
    >
      <h1 className="font-fraunces text-4xl font-light text-primary mb-6">
        Reset Your Password
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block font-inter text-base text-primary">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="w-full h-12 px-4 border-2 border-primary rounded-lg
                       font-inter text-base placeholder-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-primary transition-all duration-200"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={resetPasswordMutation.isLoading}
          className="w-full h-12 bg-primary text-white font-inter font-bold text-base
                   rounded-lg hover:bg-primary-dark transition-all duration-200"
        >
          {resetPasswordMutation.isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </motion.div>
  );
};
