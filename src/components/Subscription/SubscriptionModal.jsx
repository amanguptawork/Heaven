import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCheckLine,
  RiCloseLine,
  RiArrowDownLine,
  RiArrowUpLine,
} from "react-icons/ri";
import { loadStripe } from "@stripe/stripe-js";
import { PaystackButton } from "react-paystack";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const ModalPortal = ({ children }) => {
  // Create a div for our modal
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    // Create div and add it to the end of the body
    const modalRootDiv = document.createElement("div");
    modalRootDiv.setAttribute("id", "subscription-modal-root");
    document.body.appendChild(modalRootDiv);
    setModalRoot(modalRootDiv);

    // Clean up function to remove the div when component unmounts
    return () => {
      if (document.body.contains(modalRootDiv)) {
        document.body.removeChild(modalRootDiv);
      }
    };
  }, []);

  // Only render when modalRoot is available
  return modalRoot ? ReactDOM.createPortal(children, modalRoot) : null;
};

const SubscriptionModal = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [freeExpanded, setFreeExpanded] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullViewPlan, setFullViewPlan] = useState(null);

  const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const API_URL = import.meta.env.VITE_API_URL;
  const [paystackConfig, setPaystackConfig] = useState(null);
  // All useEffect hooks MUST come before any conditional returns
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const storedUserData = localStorage.getItem("userData");

      if (!token || !storedUserData) {
        navigate("/login");
        return;
      }

      setUserData(JSON.parse(storedUserData));
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const toggleFreeExpansion = () => {
    setFreeExpanded(!freeExpanded);
  };

  const togglePlanExpansion = (planId) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  // Add this after the togglePlanExpansion function
  const handleFullView = (plan = null) => {
    setFullViewPlan(plan);
  };

  const freeFeatures = {
    brief: (
      <>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Create your personality profile.</span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>20 maximum free swipes.</span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Message matches and more...</span>
        </li>
      </>
    ),
    detailed: (
      <>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>
            See everyone who liked you and message a maximum of 10 people who
            liked you.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Message a maximum of 4 personality matches.</span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Receive a maximum of 10 messages from premium users.</span>
        </li>
      </>
    ),
  };

  const premiumFeatures = {
    brief: (
      <>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Create your personality profile.</span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>50 maximum swipes per day</span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Premium features and more...</span>
        </li>
      </>
    ),
    detailed: (
      <>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>
            See everyone who liked you and message daily up to 30 people who
            liked you.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>
            See all your personality matches and message a maximum of 30
            personality matches monthly.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>
            Receive a maximum of 50 messages from premium users monthly.
          </span>
        </li>

        <li className="flex items-center gap-2">
          <RiCheckLine className="text-green-500 flex-shrink-0" />
          <span>Video profile</span>
        </li>
      </>
    ),
  };
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/subscription/plans`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch plans");

      if (data.success) {
        // Sort plans in desired order
        const sortedPlans = data.data.sort((a, b) => {
          const order = { monthly: 1, biannual: 2, annual: 3 };
          return order[a.name] - order[b.name];
        });
        setPlans(sortedPlans);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  // In handleStripePayment function, store plan info in session storage before redirect
  const handleStripePayment = async (plan) => {
    try {
      setProcessingPayment(true);
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData?.id || !userData?.email) {
        throw new Error("User data is missing");
      }

      const paymentData = {
        userId: userData.id,
        planId: plan.id,
        currency: "USD",
        provider: "stripe",
        email: userData.email,
      };

      const response = await fetch(
        `${API_URL}/subscription/create-payment-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Payment session creation failed");
      }

      if (!result.success || !result.data?.sessionId) {
        throw new Error("Invalid payment session");
      }

      // Calculate duration based on plan name since the duration object might not be available
      let totalDays = 0;

      if (plan.name === "monthly") {
        totalDays = 30; // 1 month
      } else if (plan.name === "biannual") {
        totalDays = 180; // 6 months
      } else if (plan.name === "annual") {
        totalDays = 365; // 12 months
      } else if (plan.duration && plan.duration.months) {
        // Fallback to the original calculation if available
        const months = plan.duration.months || 0;
        const freeMonths = plan.duration.freeMonths || 0;
        totalDays = (months + freeMonths) * 30;
      }

      // Store both the plan and the totalDays
      const enhancedPlan = {
        ...plan,
        calculatedTotalDays: totalDays,
      };

      sessionStorage.setItem("selectedPlan", JSON.stringify(enhancedPlan));
      sessionStorage.setItem("subscriptionTotalDays", String(totalDays));

      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);

      if (!stripe) throw new Error("Failed to initialize payment system");

      const { error } = await stripe.redirectToCheckout({
        sessionId: result.data.sessionId,
      });

      if (error) {
        console.error("Stripe redirect error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error(error.message || "Payment failed");
      navigate("/subscription/failure", { replace: true });
    } finally {
      setProcessingPayment(false);
    }
  };

  const createPaystackConfig = (plan) => {
    if (!userData?.email) {
      toast.error("Please login again to continue");
      return null;
    }

    return {
      reference: `sub_${Date.now()}`,
      email: userData.email,
      amount: plan.prices.NGN * 100,
      publicKey: PAYSTACK_PUBLIC_KEY,
      metadata: {
        userId: userData._id,
        planId: plan.id,
      },
      text: `Pay ₦${plan.prices.NGN.toLocaleString()}`,
      onSuccess: (reference) => handlePaystackSuccess(reference, plan),
      onClose: () => toast.info("Payment cancelled"),
    };
  };

  const handlePaystackSuccess = async (reference, plan) => {
    try {
      setProcessingPayment(true);

      const verificationData = {
        paymentId: reference.reference || reference,
        provider: "paystack",
        planId: plan.id,
        userId: userData._id,
      };

      const response = await fetch(`${API_URL}/subscription/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(verificationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Payment verification failed");
      }

      toast.success(
        `Subscription upgraded successfully! You now have premium access.`
      );

      onClose();
      // window.location.href = "/dashboard";
      navigate("/subscription/success", { replace: true });
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast.error(error.message || "Payment verification failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayment = async (plan) => {

    if (!plan) {
      toast.error("Please select a plan first");
      return;
    }

    if (!paymentProvider) {
      toast.error("Please select a payment method");
      return;
    }

    if (processingPayment) {
      toast.info("Payment is processing...");
      return;
    }

    if (paymentProvider === "stripe") {
      await handleStripePayment(plan);
    } else if (paymentProvider === "paystack") {
      // Create Paystack config and initiate payment directly
      const config = createPaystackConfig(plan);
      if (config) {
        setPaystackConfig(config);
        // Instead of immediately clicking, use setTimeout to allow React to render first
        setTimeout(() => {
          const paystackBtn = document.getElementById("paystack-payment-btn");
          if (paystackBtn) {
            paystackBtn.click();
          } else {
            toast.error("Payment initialization failed");
          }
        }, 100);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <ModalPortal>
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-6xl w-full relative"
            >
              {/* All your existing modal content */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-8 h-8" />
              </button>
              <div className="max-h-[90vh] overflow-auto">
                <div className="text-center mb-8">
                  <img
                    src="/premiumhone.png"
                    alt="Premium"
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <h2 className="text-3xl font-bold mt-4">
                    Upgrade Your Love Journey
                  </h2>
                  <p className="text-gray-600 mt-2">Choose your perfect plan</p>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => setPaymentProvider("stripe")}
                    className={`px-4 py-2 rounded ${
                      paymentProvider === "stripe"
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Pay with Stripe (Credit/Debit Card)
                  </button>
                  <button
                    onClick={() => setPaymentProvider("paystack")}
                    className={`px-4 py-2 rounded ${
                      paymentProvider === "paystack"
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Pay with Paystack (Nigerians)
                  </button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* Free Plan Feature List */}
                  <motion.div
                    key="free-plan"
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-2xl border-2 border-gray-200"
                  >
                    <h3 className="text-2xl font-bold">Free Users</h3>
                    <div className="mt-4">
                      <p className="text-3xl font-bold">$0</p>
                      <p className="text-sm text-gray-600">
                        No Payment Required
                      </p>

                      {/* Feature List for Free Users */}
                      <ul className="mt-6 space-y-3">
                        {freeExpanded ? (
                          <>
                            {freeFeatures.detailed}
                            <button
                              onClick={toggleFreeExpansion}
                              className="flex items-center gap-1 text-purple-500 hover:text-purple-700 transition-colors mt-2 text-sm font-medium"
                            >
                              <RiArrowUpLine />
                              <span>Show less</span>
                            </button>
                          </>
                        ) : (
                          <>
                            {freeFeatures.brief}
                            <button
                              onClick={toggleFreeExpansion}
                              className="flex items-center gap-1 text-purple-500 hover:text-purple-700 transition-colors mt-2 text-sm font-medium"
                            >
                              <RiArrowDownLine />
                              <span>Show more</span>
                            </button>
                          </>
                        )}
                      </ul>
                    </div>
                  </motion.div>

                  {/* 2) Premium plan mapping */}
                  {/* Replace the premium plans section with this updated version */}
                  {fullViewPlan ? (
                    // Full view of a single plan
                    <motion.div
                      key={`fullview-${fullViewPlan._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-3 p-8 rounded-2xl border-2 border-purple-500 bg-purple-50 relative"
                    >
                      <button
                        onClick={() => handleFullView(null)}
                        className="absolute top-4 left-4 text-purple-500 hover:text-purple-700 flex items-center gap-1 font-medium"
                      >
                        <RiArrowUpLine className="rotate-90" />
                        <span>Back to all plans</span>
                      </button>

                      <div className="text-center mb-6">
                        <h3 className="text-3xl font-bold capitalize">
                          {fullViewPlan.name}
                        </h3>
                        <div className="mt-2 text-2xl font-bold">
                          {paymentProvider === "paystack"
                            ? `₦${fullViewPlan.prices.NGN.toLocaleString()}`
                            : `$${fullViewPlan.prices.USD}`}
                        </div>

                        {/* Add savings information for Paystack in full view */}
                        {paymentProvider === "paystack" &&
                          fullViewPlan.name === "biannual" && (
                            <div className="mt-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block">
                              Save ₦5,000
                            </div>
                          )}

                        {paymentProvider === "paystack" &&
                          fullViewPlan.name === "annual" && (
                            <div className="mt-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block">
                              Save ₦15,000
                            </div>
                          )}

                        {/* Add savings information for Stripe in full view */}
                        {paymentProvider === "stripe" &&
                          fullViewPlan.name === "biannual" && (
                            <div className="mt-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block">
                              Save $5
                            </div>
                          )}

                        {paymentProvider === "stripe" &&
                          fullViewPlan.name === "annual" && (
                            <div className="mt-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full inline-block">
                              Save $15
                            </div>
                          )}

                        <p className="text-purple-600">
                          {fullViewPlan.name === "monthly"
                            ? "1 month"
                            : fullViewPlan.name === "biannual"
                            ? "6 months"
                            : "12 months"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-lg mb-4">
                            Premium Features:
                          </h4>
                          <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <RiCheckLine className="text-purple-500 w-5 h-5" />
                              </div>
                              <span>Create your personality profile</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <RiCheckLine className="text-purple-500 w-5 h-5" />
                              </div>
                              <span>50 maximum swipes per day</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <RiCheckLine className="text-purple-500 w-5 h-5" />
                              </div>
                              <span>See everyone who liked you</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <RiCheckLine className="text-purple-500 w-5 h-5" />
                              </div>
                              <span>Message daily up to 30 people</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-4">
                            Additional Benefits:
                          </h4>
                          <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <RiCheckLine className="text-purple-500 w-5 h-5" />
                              </div>
                              <span>See all your personality matches</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <RiCheckLine className="text-purple-500 w-5 h-5" />
                              </div>
                              <span>
                                Message up to 30 personality matches monthly
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        {paymentProvider === "paystack" ? (
                          <PaystackButton
                            {...createPaystackConfig(fullViewPlan)}
                            className="py-3 px-6 rounded-xl transition-colors bg-purple-500 text-white hover:bg-purple-600 text-lg"
                          />
                        ) : (
                          <button
                            onClick={() => handlePayment(fullViewPlan)}
                            disabled={!paymentProvider}
                            className={`py-3 px-6 rounded-xl transition-colors text-lg ${
                              paymentProvider
                                ? "bg-purple-500 text-white hover:bg-purple-600"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                          >
                            Subscribe to {fullViewPlan.name}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    // Normal view with all plans
                    plans.map((plan) => (
                      <motion.div
                        key={plan._id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-6 rounded-2xl border-2 ${
                          selectedPlan?._id === plan._id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <h3 className="text-2xl font-bold capitalize">
                          {plan.name}
                        </h3>
                        <div className="mt-4">
                          <div className="text-3xl font-bold">
                            {paymentProvider === "paystack"
                              ? `₦${plan.prices.NGN.toLocaleString()}`
                              : `$${plan.prices.USD}`}
                          </div>

                          <div className="flex items-center mt-1 gap-2">
                            {/* Add savings information for Paystack */}
                            {paymentProvider === "paystack" &&
                              plan.name === "biannual" && (
                                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full inline-block">
                                  Save ₦5,000
                                </div>
                              )}

                            {paymentProvider === "paystack" &&
                              plan.name === "annual" && (
                                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full inline-block">
                                  Save ₦15,000
                                </div>
                              )}

                            {/* Add savings information for Stripe */}
                            {paymentProvider === "stripe" &&
                              plan.name === "biannual" && (
                                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full inline-block">
                                  Save $5
                                </div>
                              )}

                            {paymentProvider === "stripe" &&
                              plan.name === "annual" && (
                                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full inline-block">
                                  Save $15
                                </div>
                              )}

                            <p className="text-sm text-gray-600">
                              {plan.name === "monthly"
                                ? "1 month"
                                : plan.name === "biannual"
                                ? "6 months"
                                : "12 months"}
                            </p>
                          </div>

                          {/* Premium plans brief section */}
                          <ul className="mt-6 space-y-3">
                            {premiumFeatures.brief}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent plan selection
                                handleFullView(plan);
                              }}
                              className="flex items-center gap-1 text-purple-500 hover:text-purple-700 transition-colors mt-2 text-sm font-medium"
                            >
                              <RiArrowDownLine />
                              <span>Show more</span>
                            </button>
                          </ul>

                          {/* Payment buttons */}
                          {paymentProvider === "paystack" ? (
                            <PaystackButton
                              {...createPaystackConfig(plan)}
                              className="w-full mt-6 py-3 rounded-xl transition-colors bg-purple-500 text-white hover:bg-purple-600"
                            />
                          ) : (
                            <button
                              onClick={() => handlePayment(plan)}
                              disabled={!paymentProvider}
                              className={`w-full mt-6 py-3 rounded-xl transition-colors ${
                                paymentProvider
                                  ? "bg-purple-500 text-white hover:bg-purple-600"
                                  : "bg-gray-300 cursor-not-allowed"
                              }`}
                            >
                              Choose {plan.name}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Hidden Paystack button that gets programmatically clicked */}
                {paystackConfig && (
                  <div style={{ display: "none" }}>
                    <PaystackButton
                      id="paystack-payment-btn"
                      {...paystackConfig}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
};

export default SubscriptionModal;
