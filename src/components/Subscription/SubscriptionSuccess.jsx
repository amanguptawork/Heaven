import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiCheckboxCircleLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [planDetails, setPlanDetails] = useState(null);
  const [subscriptionDuration, setSubscriptionDuration] = useState("");
  const [countdown, setCountdown] = useState(5); // countdown in seconds

  useEffect(() => {
    // Try to get plan info from session storage (from Stripe redirect)
    const storedPlan = sessionStorage.getItem("selectedPlan");
    const totalDays = sessionStorage.getItem("subscriptionTotalDays");

    if (storedPlan) {
      const plan = JSON.parse(storedPlan);
      setPlanDetails(plan);

      // Set human-readable subscription duration
      let durationText = "";
      if (plan.name === "monthly") {
        durationText = "1 month";
      } else if (plan.name === "biannual") {
        durationText = "6 months";
      } else if (plan.name === "annual") {
        durationText = "12 months";
      } else if (totalDays) {
        durationText = `${totalDays} days`;
      }

      setSubscriptionDuration(durationText);

      // Clear session storage after use
      sessionStorage.removeItem("selectedPlan");
      sessionStorage.removeItem("subscriptionTotalDays");

      // Show success toast with the proper plan name and duration
      const planName = plan.name.charAt(0).toUpperCase() + plan.name.slice(1);
      console.log(
        `Successfully subscribed to ${planName} plan for ${durationText}`
      );
      toast.success(
        `Subscription upgraded successfully! You now have ${planName} access for ${durationText}.`
      );
    } else {
      // Fetch subscription details if not in session storage
      const fetchSubscriptionDetails = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const response = await fetch(
            `${API_URL}/subscription/subscription-status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          const data = await response.json();
          if (data.success) {
            setPlanDetails(data.data);

            // Set duration based on plan name
            if (data.data.plan) {
              let durationText = "";
              if (data.data.plan === "monthly") {
                durationText = "1 month";
              } else if (data.data.plan === "biannual") {
                durationText = "6 months";
              } else if (data.data.plan === "annual") {
                durationText = "12 months";
              }
              setSubscriptionDuration(durationText);
            }

            // Show success toast based on fetched data
            toast.success("Subscription upgraded successfully!");
          }
        } catch (err) {
          console.error("Error fetching subscription details:", err);
          toast.success("Subscription activated!"); // Generic success message
        }
      };

      fetchSubscriptionDetails();
    }

    // Refresh user data to update subscription status
    if (refreshUser) {
      refreshUser();
    }

    // Set up countdown interval
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    // Auto-redirect after countdown ends
    const redirectTimeout = setTimeout(() => {
      window.location.href = "/dashboard";
    }, countdown * 1000);

    return () => {
      clearTimeout(redirectTimeout);
      clearInterval(countdownInterval);
    };
  }, [navigate, refreshUser, countdown]);

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block"
        >
          <RiCheckboxCircleLine className="w-24 h-24 text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-bold mt-6">Subscription Activated!</h1>
        <p className="text-gray-600 mt-2">
          {planDetails?.name
            ? `Your ${
                planDetails.name.charAt(0).toUpperCase() +
                planDetails.name.slice(1)
              } plan is now active`
            : "Your premium subscription is now active"}
          {subscriptionDuration ? ` for ${subscriptionDuration}!` : "!"}
        </p>

        <p className="text-gray-600 mt-2">
          You will be redirected to the dashboard in {countdown} second
          {countdown !== 1 ? "s" : ""}.
        </p>

        <div className="mt-8 flex space-x-4 justify-center">
          <button
            onClick={goToDashboard}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionSuccess;
