import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { resetPassword } from '../../api/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => resetPassword({ token, password: data.password }),
    onSuccess: () => {
      toast.dismiss();
      toast.success('Password reset successful');
      navigate('/login');
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Password reset failed');
    }
  });

  const onSubmit = (data) => {
    resetPasswordMutation.mutate({
      token,
      password: data.password
    });
  };
  
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8"
    >
      <h1 className="text-3xl font-bold mb-6">Reset Your Password</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={resetPasswordMutation.isLoading}
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark
                   transition-colors duration-200"
        >
          {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </motion.div>
  );
};
