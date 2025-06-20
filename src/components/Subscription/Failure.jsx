import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiErrorWarningLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

const SubscriptionFailure = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5); // Countdown in seconds

  useEffect(() => {
    toast.error('Payment failed. Please check your card details or try again.');

    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard'); // Redirect to the subscription page to try again
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mb-6"
      >
        <RiErrorWarningLine className="w-24 h-24 text-red-500" />
      </motion.div>
      <h1 className="text-3xl font-bold">Payment Failed</h1>
      <p className="text-gray-600 mt-4 text-center max-w-md">
        Unfortunately, your payment was not successful.
        Please check your card details or try a different payment method.
      </p>
      <p className="text-gray-600 mt-2">
        You will be redirected to the subscription page in {countdown} second{countdown !== 1 && 's'}.
      </p>
      <div className="mt-8 flex space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Go to Dashboard
        </button>
      </div>
    </motion.div>
  );
};

export default SubscriptionFailure;
