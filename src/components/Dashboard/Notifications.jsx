import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  fetchUnreadNotifications,
  markNotificationAsRead,
} from "../../api/notifications";
import {
  getPersonalityMatches,
  getWhoLikedMe,
  markLikeAsSeen,
  updatePreferencesSeen,
} from "../../api/matches";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { RiHeartsFill, RiUserHeartLine, RiMessageLine } from "react-icons/ri";
import { useUserLimits } from "../../context/UserLimitsContext";
import SubscriptionModal from "../Subscription/SubscriptionModal";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("matches");
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Import user limits from context
  const {
    subscriptionStatus,
    messagedLikedProfiles,
    trackMessagedProfile,
    canMessageProfile,
    setWhoLikedMeIds,
    FREE_LIKED_MESSAGE_LIMIT,
    PREMIUM_DAILY_MESSAGE_LIMIT,
    dailyMessagesSent,
    canViewProfile,
    trackViewedProfile,
    getRemainingViewCount,
    getRemainingMessageCount,
  } = useUserLimits();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchUnreadNotifications,
  });

  const { data: personalityMatches, refetch: refetchMatches } = useQuery({
    queryKey: ["personalityMatches"],
    queryFn: getPersonalityMatches,
  });

  useEffect(() => {
    refetchMatches();
  }, []);

  const {
    data: whoLikedMe,
    isLoading: loadingLikes,
    refetch: refetchWho,
  } = useQuery({
    queryKey: ["whoLikedMe"],
    queryFn: getWhoLikedMe,
  });

  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setExpandedNotification(
        expandedNotification === notificationId ? null : notificationId
      );
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleProfileClick = (userId, idx) => {
    // If user is free and trying to view beyond the first 4 personality matches
    if (
      subscriptionStatus !== "premium" &&
      activeTab === "matches" &&
      idx >= 4
    ) {
      setShowSubscriptionModal(true);
      return;
    }
  };

  // Function to message a user with limits
  const handleMessageUser = async (likerId) => {
    // Check if user can message this profile with isLiker=true for 'likes' tab
    const isFromLiker = activeTab === "likes";
    if (!canMessageProfile(likerId, !isFromLiker)) {
      setShowSubscriptionModal(true);
      return;
    }

    // Attempt to create/join chat room
    try {
      const authToken = localStorage.getItem("authToken");
      const currentUserData = localStorage.getItem("userData");
      if (!currentUserData) {
        alert("Please log in to continue.");
        return;
      }
      const currentUser = JSON.parse(currentUserData);
      const currentUserId = currentUser.id || currentUser._id;

      if (!currentUserId) {
        alert("Please log in to continue.");
        return;
      }

      localStorage.setItem("second_person", likerId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            participant_1: currentUserId,
            participant_2: likerId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Chat room creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create chat room");
      }

      const data = await response.json();
      if (data.success) {
        // Track messaged profile in context
        trackMessagedProfile(likerId, !isFromLiker);
        navigate(`/chat/${data.room._id}`);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
      alert("Unable to create chat room. Please try again.");
    }
  };

  const tabs = [
    {
      id: "matches",
      label: "Personality Matches",
      icon: RiHeartsFill,
      count: personalityMatches?.count || 0,
    },
    {
      id: "likes",
      label: "Who Liked Me",
      icon: RiUserHeartLine,
      count: whoLikedMe?.unseenCount || 0,
    },
  ];

  // Update who liked me IDs in context when data changes
  useEffect(() => {
    if (whoLikedMe && whoLikedMe.length > 0) {
      const likerIds = whoLikedMe.map((liker) => liker._id);
      setWhoLikedMeIds(likerIds);
    }
  }, [whoLikedMe, setWhoLikedMeIds]);

  const renderContent = () => {
    switch (activeTab) {
      case "notifications":
        return (
          <AnimatePresence>
            {notifications?.notifications?.map((notification) => (
              <motion.div
                key={notification._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4 cursor-pointer
                  transition-all duration-300 ${
                    expandedNotification === notification._id ? "scale-102" : ""
                  }`}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {notification.image && (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={notification.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        height:
                          expandedNotification === notification._id
                            ? "auto"
                            : "1.5rem",
                      }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-700">{notification.message}</p>
                    </motion.div>
                    {notification.type && (
                      <span className="mt-2 inline-block text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                        {notification.type}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        );

      case "matches":
        return (
          <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4">
            {personalityMatches?.matches?.map((match) => {
              const id = match.matchedUser._id;
              const canView = canViewProfile(id, true);
              const canMsg = canMessageProfile(id, true);
              const isLocked =
                subscriptionStatus === "free" && (!canView || !canMsg);
              return (
                <motion.div
                  key={match?.matchedUser?._id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-white relative rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${
                    isLocked
                      ? "opacity-80"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => {
                    if (isLocked) {
                      setShowSubscriptionModal(true);
                    } else {
                      navigate(`/user-profile/${match.matchedUser._id}`);
                    }
                  }}
                >
                  <div className="flex md:items-center items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={match?.matchedUser?.photos?.[0]}
                        alt={match?.matchedUser?.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between flex-1 md:items-center flex-nowrap gap-4 md:gap-0 flex-col md:flex-row items-start">
                      <div>
                        <h3 className="font-semibold">
                          {match?.matchedUser?.fullName}
                        </h3>
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <RiHeartsFill /> {match.compatibilityScore}% Match
                        </span>
                      </div>
                      <div className="md:text-right text-left">
                        {match.block ? (
                          <span className="text-xs text-red-500 ml-1">
                            (Blocked)
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (isLocked) {
                                  setShowSubscriptionModal(true);
                                  return;
                                }
                                trackViewedProfile(id, true);
                                navigate(
                                  `/user-profile/${match.matchedUser?._id}`
                                );
                                if (!match.isSeen) {
                                  await updatePreferencesSeen(match._id);
                                }
                              }}
                              className={`ml-auto border-2 border-purple-600 text-purple-600 py-2 px-4 rounded-xl hover:bg-purple-50 transition-all font-semibold text-xs ${
                                isLocked
                                  ? "opacity-50"
                                  : ""
                              }`}
                            >
                              View Profile
                            </button>
                            <p className="text-xs capitalize pt-1 text-gray-600">
                              {match?.isSeen ? "Viewed" : "Not Viewed"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );

      case "likes":
        return (
          <div className="space-y-4">
            {loadingLikes ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : whoLikedMe?.likers?.length > 0 ? (
              <>
                {/* Show remaining messages counter */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {subscriptionStatus === "premium"
                      ? `You can message ${
                          PREMIUM_DAILY_MESSAGE_LIMIT - dailyMessagesSent
                        } more people today`
                      : `Free users can message up to ${FREE_LIKED_MESSAGE_LIMIT} people who liked you (${
                          FREE_LIKED_MESSAGE_LIMIT -
                          messagedLikedProfiles.length
                        } remaining)`}
                  </p>
                </div>

                {whoLikedMe?.likers.map((liker, idx) => (
                  <motion.div
                    key={liker._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full overflow-hidden cursor-pointer"
                        onClick={() => {
                          handleProfileClick(liker._id, idx);
                          handleMessageUser(liker._id);
                        }}
                      >
                        <img
                          src={liker.photos[0]}
                          alt={liker.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {liker.fullName}{" "}
                          {liker.block && (
                            <span className="text-xs text-red-500 ml-1">
                              (Blocked)
                            </span>
                          )}
                        </h3>
                        <span className="text-sm text-purple-600 flex items-center gap-1">
                          <RiUserHeartLine /> Likes You
                        </span>
                      </div>
                      {!liker.block && (
                        <div className="flex flex-col items-end">
                          {/* Button to mark as seen */}
                          <button
                            className={`mb-2 rounded-md px-2 py-1 bg-purple-100 text-gray-800 text-sm hover:text-purple-600 ${
                              liker.isSeen
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!liker.isSeen) {
                                try {
                                  await markLikeAsSeen(
                                    liker.matchInteractionId
                                  );
                                  refetchWho();
                                } catch (error) {
                                  console.error(
                                    "Failed to mark like as seen:",
                                    error
                                  );
                                }
                              }
                            }}
                            disabled={liker.isSeen}
                          >
                            {liker.isSeen ? "Seen" : "Mark as Seen"}
                          </button>
                          <button
                            className={`text-gray-500 hover:text-purple-600 ${
                              !canMessageProfile(liker._id, !true)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessageUser(liker._id);
                            }}
                          >
                            <RiMessageLine className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No one has liked you yet
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1  p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Activity Center
            </h1>

            <div className="flex gap-4 mb-8 flex-wrap">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                    ${
                      activeTab === tab.id
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[9999]">
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Notifications;
