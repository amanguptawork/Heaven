import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { forgotPassword } from '../../api/auth';
import { motion } from 'framer-motion';

export const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setIsEmailSent(true);
      toast.dismiss()
      toast.success('Password reset email sent');
    },
    onError: (error) => {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    }
  });

  const onSubmit = (data) => {
    forgotPasswordMutation.mutate(data.email);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8"
    >
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      
      {!isEmailSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isLoading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark
                     transition-colors duration-200"
          >
            {forgotPasswordMutation.isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Check your email for password reset instructions.
          </p>
          <a href="/login" className="text-primary hover:underline">
            Back to Login
          </a>
        </div>
      )}
    </motion.div>
  );
};
