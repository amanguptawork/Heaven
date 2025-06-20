import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, format, isValid, parseISO } from "date-fns";
import {
  RiEditFill,
  RiMapPinLine,
  RiCalendarLine,
  RiUserHeartLine,
  RiGalleryLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiHeartLine,
  RiUserLine,
  RiCloseLine,
  RiVideoAddLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import useUserProfileStore from "../../store/user";

const Profile = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const { userProfile } = useUserProfileStore();

  const formatBirthYear = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Not specified";
      return format(date, "yyyy");
    } catch (error) {
      return "Not specified";
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/subscription/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            subscriptionId:
              userProfile.subscription?.paymentProvider === "paystack"
                ? userProfile.subscription.paystackSubscriptionId
                : userProfile.subscription.stripeSubscriptionId,
          }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        alert("Subscription cancelled successfully.");
        // Optionally, update your store or refetch userProfile after cancellation.
        window.location.reload();
      } else {
        alert(result.message || "Failed to cancel subscription.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Something went wrong.");
    }
  };

  const renderContent = () => {
    if (!userProfile) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
        </div>
      );
    }

    const startDate = userProfile.subscription
      ? new Date(userProfile.subscription.startDate)
      : null;
    const endDate = userProfile.subscription
      ? new Date(userProfile.subscription.endDate)
      : null;

    const totalDays =
      startDate && endDate ? differenceInDays(endDate, startDate) : null;
    // Also calculate how many days remain from today
    const daysLeft = endDate ? differenceInDays(endDate, new Date()) : null;

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="relative h-96">
            <img
              src={userProfile.photos?.[0]}
              alt="Cover"
              className="w-full h-full object-contain object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute top-6 right-6 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/edit-profile`)}
                className="px-6 py-3 bg-white rounded-xl text-gray-900 font-semibold shadow-lg flex items-center gap-2"
              >
                <RiEditFill /> Edit Profile
              </motion.button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end gap-8">
                <div className="flex-1">
                  <p className="text-sm text-white font-semibold bg-purple-600 px-3 py-1 inline-block rounded-xl mb-2">
                    {userProfile.subscriptionStatus === "premium"
                      ? "Premium Member"
                      : "Free Member"}
                  </p>
                  <h1 className="text-5xl font-bold text-white mb-4">
                    {userProfile.fullName}
                  </h1>
                  <div className="flex items-center gap-6 text-white/90">
                    <span className="flex items-center gap-2">
                      <RiMapPinLine className="w-5 h-5" />
                      {userProfile.location || "Location not specified"}
                    </span>
                    <span className="flex items-center gap-2">
                      <RiCalendarLine className="w-5 h-5" />
                      {formatBirthYear(userProfile.dateOfBirth)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12  gap-8">
          <div className="xl:col-span-8 md:col-span-12 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <RiUserHeartLine className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed break-words">
                  {userProfile.about || "No description provided"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <RiGalleryLine className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {userProfile.photos?.map((photo, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-[4/5] rounded-xl overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => setSelectedImage(photo)}
                  >
                    <img
                      src={photo}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            {userProfile.videoUrl &&
              userProfile.subscriptionStatus === "premium" && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <RiVideoAddLine className="w-6 h-6 text-purple-500" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        Video
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm">
                      <video
                        src={userProfile.videoUrl}
                        controls
                        className="w-full rounded-xl shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="xl:col-span-4 md:col-span-12 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Basic Info
              </h2>
              <div className="space-y-6">
                <InfoItem
                  icon={RiBriefcaseLine}
                  label="Occupation"
                  value={userProfile.occupation}
                />
                <InfoItem
                  icon={RiBuilding2Line}
                  label="Church"
                  value={userProfile.churchDenomination}
                />
                <InfoItem
                  icon={RiHeartLine}
                  label="Status"
                  value={userProfile.maritalStatus}
                />
                <InfoItem
                  icon={RiUserLine}
                  label="Gender"
                  value={userProfile.gender}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests?.map((interest, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium"
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </div>

            {userProfile?.subscription && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Subscription Details
                </h2>

                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan:</span>
                    <span className="capitalize font-medium">
                      {userProfile.subscription.plan}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">
                      {userProfile.subscription.amount.currency}{" "}
                      {userProfile.subscription.amount.value}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Start Date:</span>
                    {startDate ? (
                      <span className="font-medium">
                        {format(startDate, "dd/MMM/yyyy")}
                      </span>
                    ) : (
                      <span className="font-medium">Not specified</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">End Date:</span>
                    {endDate ? (
                      <span className="font-medium">
                        {format(endDate, "dd/MMM/yyyy")}
                      </span>
                    ) : (
                      <span className="font-medium">Not specified</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>

                    <span className="font-medium">
                      {totalDays && `${totalDays} days`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`font-semibold capitalize ${
                        userProfile.subscription.status === "active"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {userProfile.subscription.status}
                    </span>
                  </div>
                  {daysLeft !== null && daysLeft >= 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Days Left:</span>
                      <span className="font-medium">{daysLeft} days</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Features
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                    <li>
                      Swipes per day:{" "}
                      {userProfile.subscription.features.swipesPerDay}
                    </li>
                    <li>Create your personality profile</li>
                    <li>50 maximum swipes per day</li>
                    <li>See everyone who liked you</li>
                    <li>Message daily up to 30 people</li>
                    <li>See all your personality matches</li>
                    <li>Message up to 30 personality matches monthly</li>
                  </ul>
                </div>
              </div>
            )}

            {userProfile.subscription?.status === "active" && (
              <button
                onClick={handleCancelSubscription}
                className="mt-4 w-full py-2 px-4 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 !m-0 bg-black/90 z-[9999] flex items-center justify-center p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-5xl h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-full object-contain rounded-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto py-8 px-6">
        {renderContent()}
      </main>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <Icon className="w-5 h-5 text-purple-500" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium capitalize">
        {value || "Not specified"}
      </p>
    </div>
  </div>
);

export default Profile;
