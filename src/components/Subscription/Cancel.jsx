import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiErrorWarningLine } from "react-icons/ri";
import { toast } from "react-toastify";

const SubscriptionCancel = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    toast.info(
      "Payment was cancelled. Please try again if you wish to subscribe."
    );

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/dashboard");
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
      <h1 className="text-3xl font-bold">Payment Cancelled</h1>
      <p className="text-gray-600 mt-4 text-center max-w-md">
        It looks like you cancelled the payment process. If you changed your
        mind, please try again from the subscription page.
      </p>
      <p className="text-gray-600 mt-2">
        You will be redirected to your dashboard in {countdown} second
        {countdown !== 1 && "s"}.
      </p>
      <div className="mt-8 flex space-x-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Retry Payment
        </button>
      </div>
    </motion.div>
  );
};

export default SubscriptionCancel;
