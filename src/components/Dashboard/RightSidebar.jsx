import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RiCloseFill, RiMenuFill, RiMessageLine } from "react-icons/ri";
import {
  FREE_LIKED_MESSAGE_LIMIT,
  FREE_MATCH_MESSAGE_LIMIT,
  PREMIUM_DAILY_MESSAGE_LIMIT,
  useUserLimits,
} from "../../context/UserLimitsContext";
import { getPersonalityMatches, getWhoLikedMe } from "../../api/matches";
import SubscriptionModal from "../Subscription/SubscriptionModal";
import { useWindowWidth } from "../common/useWindowWidth";

const RightSidebar = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("matches");

  const {
    subscriptionStatus,
    trackMessagedProfile,
    canMessageProfile,
    setWhoLikedMeIds,
    dailyMessagesSent,
    canViewProfile,
    trackViewedProfile,
    messagedLikedProfiles,
  } = useUserLimits();

  // Show/hide subscription modal
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const isTablet = width >= 768 && width < 1024;
  // Fetch personality matches
  const { data: personalityMatches } = useQuery({
    queryKey: ["personalityMatches"],
    queryFn: getPersonalityMatches,
  });

  // Fetch whoLikedMe
  const { data: whoLikedMe, isLoading: loadingLikes } = useQuery({
    queryKey: ["whoLikedMe"],
    queryFn: getWhoLikedMe,
  });

  // Update who liked me IDs in context when data changes
  useEffect(() => {
    if (whoLikedMe && whoLikedMe.length > 0) {
      const likerIds = whoLikedMe.likers.map((liker) => liker._id);
      setWhoLikedMeIds(likerIds);
    }
  }, [whoLikedMe, setWhoLikedMeIds]);

  // Personality matches array from API.
  const userPersonalityMatches = personalityMatches?.matches || [];

  // Navigate to user profile, with subscription check.
  const handleProfileClick = (targetUserId, idx) => {
    if (
      subscriptionStatus !== "premium" &&
      activeTab === "matches" &&
      idx >= FREE_MATCH_MESSAGE_LIMIT
    ) {
      setShowSubscriptionModal(true);
      return;
    }
    navigate(`/user-profile/${targetUserId}`);
  };

  const handleMessageUser = async (likerId) => {
    const isFromLiker = activeTab === "who-liked-me";
    if (!canMessageProfile(likerId, !isFromLiker)) {
      // false indicates "who-liked-me" for free user.
      setShowSubscriptionModal(true);
      return;
    }
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
        // Track the messaged profile in the appropriate category.
        if (data.success) {
          trackMessagedProfile(likerId, false);
          navigate(`/chat/${data.room._id}`);
        }
        navigate(`/chat/${data.room._id}`);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
      alert("Unable to create chat room. Please try again.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "matches":
        return (
          <div className="grid grid-cols-2 gap-4 p-4">
            {userPersonalityMatches.map((match, idx) => {
              const id = match.matchedUser._id;
              const canView = canViewProfile(id, /* isMatch */ true);
              const isLocked = subscriptionStatus === "free" && !canView;
              return (
                <motion.div
                  key={match?.matchedUser?._id || idx}
                  whileHover={{ y: -5 }}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    if (isLocked) {
                      setShowSubscriptionModal(true);
                    } else {
                      trackViewedProfile(id, true);
                      navigate(`/user-profile/${id}`);
                    }
                  }}
                >
                  {isLocked && (
                    <div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center text-white p-4 rounded-2xl">
                      <p className="text-center mb-2">
                        {`Free users get ${FREE_MATCH_MESSAGE_LIMIT} views. 
                        You’ve used them all.`}
                      </p>
                      <button
                        className="bg-purple-600 px-4 py-2 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSubscriptionModal(true);
                        }}
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img
                      src={match?.matchedUser?.photos?.[0]}
                      alt={match?.matchedUser?.fullName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {match.compatibilityScore}% Match
                  </div>
                </motion.div>
              );
            })}
            {subscriptionStatus !== "premium" &&
              userPersonalityMatches.length > FREE_MATCH_MESSAGE_LIMIT && (
                <div
                  className="col-span-2 mt-4 p-4 bg-purple-50 rounded-xl text-center cursor-pointer"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  <p className="text-purple-700 font-medium">
                    Upgrade to see{" "}
                    {userPersonalityMatches.length - FREE_MATCH_MESSAGE_LIMIT}{" "}
                    more matches!
                  </p>
                </div>
              )}
          </div>
        );
      case "who-liked-me": {
        const uniqueLikers = whoLikedMe
          ? Array.from(
              new Map(
                whoLikedMe.likers.map((liker) => [liker._id, liker])
              ).values()
            )
          : [];
        const hasReachedLimit =
          subscriptionStatus === "free" &&
          messagedLikedProfiles.length >= FREE_LIKED_MESSAGE_LIMIT;

        return (
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {loadingLikes ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : uniqueLikers.length > 0 ? (
              <>
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
                {hasReachedLimit && (
                  <div
                    className="mt-4 p-4 bg-purple-50 rounded-xl text-center cursor-pointer"
                    onClick={() => setShowSubscriptionModal(true)}
                  >
                    <p className="text-purple-700 font-medium">
                      You’ve reached your messaging limit. Upgrade to Premium
                      for unlimited messaging!
                    </p>
                    <button className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-xl transition-all">
                      Upgrade Now
                    </button>
                  </div>
                )}
                {!hasReachedLimit &&
                  uniqueLikers.map((liker) => (
                    <motion.div
                      key={liker._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-xl shadow-sm transition-all p-4 ${
                        liker.block
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full overflow-hidden ${
                            liker.block ? "cursor-default" : "cursor-pointer"
                          }`}
                          onClick={() =>
                            !liker.block && handleProfileClick(liker._id, 0)
                          }
                        >
                          <img
                            src={liker.photos[0]}
                            alt={liker.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {liker.fullName}{" "}
                            {liker.block && (
                              <span className="text-xs text-red-500 ml-2">
                                (Blocked)
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {liker.location}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                liker.matchStatus === "matched"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {liker.matchStatus === "matched"
                                ? "Matched"
                                : "Likes You"}
                            </span>
                          </div>
                        </div>
                        {!liker.block && (
                          <button
                            className={`text-gray-500 hover:text-purple-600 ${
                              !canMessageProfile(liker._id, false)
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
      }
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {isTablet && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-2 bg-white shadow-md rounded-full focus:outline-none"
          >
            {sidebarVisible ? (
              <RiCloseFill size={24} />
            ) : (
              <RiMenuFill size={24} />
            )}
          </button>
        </div>
      )}
      {(sidebarVisible || !isTablet) && (
        <div
          className={`md:w-96 w-full md:h-screen h-full bg-white flex flex-col ${
            isTablet ? "fixed top-0 right-0 z-40 shadow-xl" : ""
          }`}
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Activity Center
            </h2>
          </div>

          <div className="flex p-4 gap-4">
            {[
              { id: "matches", label: "Personality Matches" },
              { id: "who-liked-me", label: "Who Liked Me" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      {/* </div> */}
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

export default RightSidebar;
