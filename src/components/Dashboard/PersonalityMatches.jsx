/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPersonalityMatches } from "../../api/matches";
import ErrorBoundary from "../common/ErrorBoundary";
import {
  RiHeartLine,
  RiMapPinLine,
  RiPsychotherapyLine,
  RiEmotionSadLine,
} from "react-icons/ri";
import { toast } from "react-hot-toast";
import SubscriptionModal from "../Subscription/SubscriptionModal";
import { useSocket } from "../../context/SocketContext";
import {
  FREE_MATCH_MESSAGE_LIMIT,
  useUserLimits,
} from "../../context/UserLimitsContext";
import { useWindowWidth } from "../common/useWindowWidth";

const PersonalityMatches = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isTablet = width >= 768 && width < 1024;
  const [matches, setMatches] = useState([]);
  const [previousMatchIds, setPreviousMatchIds] = useState(new Set());
  const [newCount, setNewCount] = useState(0);
  const [seenMatchIds, setSeenMatchIds] = useState(new Set());
  const [newMatchIds, setNewMatchIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, high, moderate
  const API_URL = import.meta.env.VITE_API_URL;
  const {
    subscriptionStatus,
    canMessageProfile,
    canViewProfile,
    trackMessagedProfile,
    trackViewedProfile,
    getRemainingMessageCount,
    getRemainingViewCount,
  } = useUserLimits();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const socket = useSocket();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchPersonalityMatches();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Join personal notification room when component mounts
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id || userData?._id;

    if (userId) {
      socket.emit("join_user_room", { userId });

      // Listen for match updates
      socket.on("matches_updated", () => {
        console.log("Received match update notification");
        fetchPersonalityMatches();
      });

      socket.on("matches_refreshed", () => {
        console.log("Matches refreshed successfully");
        setRefreshing(false);
        fetchPersonalityMatches();
      });
    }

    return () => {
      // Clean up listeners when component unmounts
      socket.off("matches_updated");
      socket.off("matches_refreshed");
    };
  }, [socket]);

  const fetchPersonalityMatches = async () => {
    try {
      const response = await getPersonalityMatches();
      const fresh = response.matches || [];
      const freshIds = fresh.map((m) => m.matchedUser._id);
      const newlyAdded = freshIds.filter((id) => !previousMatchIds.has(id));

      setNewCount(newlyAdded.length);
      setPreviousMatchIds(new Set(freshIds));
      // Extract matches array from response
      const list = response.matches || [];
      setMatches(list);
      const incomingIds = list.map((m) => m._id);
      const newbies = incomingIds.filter((id) => !seenMatchIds.has(id));
      setNewMatchIds(newbies);
      setSeenMatchIds(new Set(incomingIds));
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = () => {
    switch (filter) {
      case "high":
        return matches.filter((match) => match.compatibilityScore >= 80);
      case "moderate":
        return matches.filter((match) => match.compatibilityScore < 80);
      default:
        return matches;
    }
  };

  const handleRefreshMatches = () => {
    setRefreshing(true);

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id || userData?._id;
    setNewCount(0);
    if (socket && userId) {
      socket.emit("refresh_matches", { userId });
    } else {
      // Fallback to API refresh if socket isn't available
      fetchPersonalityMatches().finally(() => setRefreshing(false));
    }
  };
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm p-8">
      <RiEmotionSadLine className="text-6xl text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Matches Found
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        We haven't found your perfect match yet. Complete your personality test
        or adjust your preferences to see more matches.
      </p>
      <button
        onClick={() => navigate("/personality-test")}
        className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600 transition-all"
      >
        Take Personality Test
      </button>
    </div>
  );

  const MatchCard = ({ match, index }) => {
    if (!match) return null;

    // Updated locking logic based on message/view limits
    const canMessage = canMessageProfile(match.matchedUser._id, true);
    const canView = canViewProfile(match.matchedUser._id, true);
    const isLocked = subscriptionStatus === "free" && !canView;
    const disabledStyles = "opacity-50 cursor-not-allowed";

    const categoryLabels = {
      faithFundamentals: "Faith",
      spiritualPractices: "Spiritual",
      religiousViews: "Religious",
      familyMarriageValues: "Family",
      lifestylePersonality: "Lifestyle",
      backgroundHistory: "Background",
      culturalCommunication: "Cultural",
      personalPreferences: "Preferences",
      ministryPurpose: "Ministry",
    };

    const getScoreColor = (score) => {
      if (!score) return "bg-gray-300";
      if (score >= 90) return "bg-green-500";
      if (score >= 80) return "bg-blue-500";
      if (score >= 70) return "bg-purple-500";
      if (score >= 60) return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <motion.div
        whileHover={{ y: isLocked ? 0 : -5 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all md:max-w-sm relative"
        onClick={() => isLocked && setShowSubscriptionModal(true)}
      >
        {newMatchIds.includes(match._id) && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            New
          </span>
        )}
        {/* Replace the existing overlay logic */}
        {isLocked && (
          <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-white">
            <div className="text-2xl font-bold mb-2">Premium Feature</div>
            <p className="text-center mb-4">
              {subscriptionStatus === "free"
                ? `Free users can view ${FREE_MATCH_MESSAGE_LIMIT} profiles. Upgrade to Premium to see more!`
                : `You've reached your monthly limit. Upgrade to Premium for more!`}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSubscriptionModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-all"
            >
              Upgrade Now
            </button>
          </div>
        )}
        <div className={`relative ${isLocked ? "blur-sm" : ""}`}>
          <img
            src={match.matchedUser?.photos?.[0]}
            alt={match.matchedUser?.fullName}
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <RiHeartLine
                className={`text-xl ${
                  match.compatibilityScore >= 80
                    ? "text-red-500"
                    : "text-purple-500"
                }`}
              />
              <span className="font-bold text-lg">
                {match.compatibilityScore}%
              </span>
            </div>
            <div className="text-xs text-gray-600 text-center">
              {match.matchStrength}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {match.matchedUser?.fullName}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center">
                <RiMapPinLine className="mr-1" />
                {match.matchedUser?.location}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {match.categoryScores &&
              Object.entries(match.categoryScores).map(([category, score]) => (
                <div
                  key={category}
                  className="group relative bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-all cursor-pointer"
                  title={`${categoryLabels[category]}: ${score}%`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-1 flex items-center justify-between">
                    <span className="truncate">{categoryLabels[category]}</span>
                    <span className="text-xs font-semibold text-gray-500">
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreColor(
                        score
                      )}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="flex gap-2">
            <button
              disabled={isLocked}
              onClick={async () => {
                // Check if we can message this profile
                if (!canMessage) {
                  setShowSubscriptionModal(true);
                  return;
                }

                const success = await trackMessagedProfile(
                  match.matchedUser._id,
                  true
                );
                if (!success) {
                  setShowSubscriptionModal(true);
                  return;
                }

                const currentUser = JSON.parse(
                  localStorage.getItem("userData")
                );
                const currentUserId = currentUser?.id || currentUser?._id;

                try {
                  const response = await fetch(`${API_URL}/chat/room`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem(
                        "authToken"
                      )}`,
                    },
                    body: JSON.stringify({
                      participant_1: currentUserId,
                      participant_2: match.matchedUser._id,
                      skipMatchCheck: true,
                    }),
                  });

                  const data = await response.json();

                  if (data.success) {
                    navigate(`/chat/${data.room._id}`);
                  }
                } catch (error) {
                  console.error("Error creating chat room:", error);
                  toast.error("Unable to create chat room. Please try again.");
                }
              }}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition-all font-semibold text-sm shadow-sm hover:shadow-md"
            >
              Connect Now
            </button>

            <button
              disabled={isLocked}
              // Replace your existing onClick handler with this:
              onClick={async () => {
                // Check if we can view this profile
                if (!canView) {
                  setShowSubscriptionModal(true);
                  return;
                }

                const success = await trackViewedProfile(
                  match.matchedUser._id,
                  true
                );
                if (!success) {
                  setShowSubscriptionModal(true);
                  return;
                }

                navigate(`/user-profile/${match.matchedUser?._id}`);
              }}
              className="flex-1 border-2 border-purple-600 text-purple-600 py-2 px-4 rounded-xl hover:bg-purple-50 transition-all font-semibold text-sm"
            >
              View Profile
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1  min-h-screen">
        <div className="p-8">
          <div
            className={`flex justify-between items-start gap-5 mb-8 flex-col`}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
              <p className="text-gray-600 mt-2">
                Discover compatible partners based on faith and personality
              </p>

              {/* Add this limit display */}
              <div className="mt-3 flex gap-4">
                <div className="bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                  <span className="text-sm text-purple-700">
                    {subscriptionStatus === "premium"
                      ? `${getRemainingMessageCount(
                          true
                        )} of 30 messages remaining this month`
                      : `${getRemainingMessageCount(
                          true
                        )} of ${FREE_MATCH_MESSAGE_LIMIT} free messages remaining`}
                  </span>
                </div>

                {subscriptionStatus !== "premium" && (
                  <div className="bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                    <span className="text-sm text-purple-700">
                      {`${getRemainingViewCount(
                        true
                      )} of ${FREE_MATCH_MESSAGE_LIMIT} free profile views remaining`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-col md:flex-col xl:flex-row pt-4 md:pt-0 w-full">
              <button
                onClick={() => navigate("/personality-test")}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <RiPsychotherapyLine />
                <span>Retake Test</span>
              </button>
              <button
                onClick={handleRefreshMatches}
                disabled={refreshing}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 disabled:bg-purple-300 transition-all flex items-center gap-2"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <span>Refresh Matches</span>
                )}
                {newCount > 0 && (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {newCount}
                  </span>
                )}
              </button>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Matches</option>
                <option value="high">High Compatibility (80%+)</option>
                <option value="moderate">Moderate Compatibility</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading matches: {error}</p>
            </div>
          ) : filteredMatches().length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMatches().map((match, index) => (
                <MatchCard
                  key={match?.userId || index}
                  match={match}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Subscription Modal */}
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

export default function PersonalityMatchesWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong loading matches</div>}>
      <PersonalityMatches />
    </ErrorBoundary>
  );
}
