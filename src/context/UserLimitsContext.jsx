import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../api/axios";

// 1) Define free user limits separately
export const FREE_MATCH_MESSAGE_LIMIT = 10; // for "Personality Matches"
export const FREE_LIKED_MESSAGE_LIMIT = 10; // for "Who Liked Me"

// 2) Define premium user limits
export const PREMIUM_DAILY_MESSAGE_LIMIT = 30;
export const PREMIUM_MONTHLY_MESSAGE_LIMIT = 30;

const UserLimitsContext = createContext();

export const UserLimitsProvider = ({ children }) => {
  // State for each type of free messaging
  const [messagedMatchProfiles, setMessagedMatchProfiles] = useState([]);
  const [messagedLikedProfiles, setMessagedLikedProfiles] = useState([]);
  const [messagesSendCount, setMessagesSendCount] = useState(0);
  const [messagesLimit] = useState(10);
  const [messagedProfiles, setMessagedProfiles] = useState([]);
  const [viewedProfiles, setViewedProfiles] = useState([]);
  const [viewedMatchProfiles, setViewedMatchProfiles] = useState([]);

  // Premium vs free info
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [premiumMessagesRemaining, setPremiumMessagesRemaining] = useState(30);

  // Daily counters & last reset
  const [dailyMessagesSent, setDailyMessagesSent] = useState(0);
  const [lastDailyReset, setLastDailyReset] = useState(null);
  const [premiumMessagedUserIds, setPremiumMessagedUserIds] = useState([]);
  const [whoLikedMeIds, setWhoLikedMeIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────
  //  A) Fetch from server once on mount
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchUserLimits = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const { data } = await axiosInstance.get("/users/limits");

        // 1) Destructure what the server returns
        const {
          messagedMatchProfiles = [],
          messagedLikedProfiles = [],
          viewedProfiles = [],
          viewedMatchProfiles = [],
          subscriptionStatus = "free",
          premiumMessagesRemaining = 30,
          dailyMessagesSent = 0,
          // If your server sends lastDailyReset or similar, handle that too
        } = data;

        // 2) Initialize state from server
        setMessagedMatchProfiles(messagedMatchProfiles);
        setMessagedLikedProfiles(messagedLikedProfiles);
        setViewedProfiles(viewedProfiles);
        setViewedMatchProfiles(viewedMatchProfiles);
        setSubscriptionStatus(subscriptionStatus);
        setPremiumMessagesRemaining(premiumMessagesRemaining);
        setDailyMessagesSent(dailyMessagesSent);
      } catch (error) {
        console.error("Error fetching user limits:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserLimits();
  }, []);

  // ─────────────────────────────────────────
  //  B) One-time daily reset in a useEffect
  // ─────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const today = now.toDateString();

    // Only do this check once on mount
    if (lastDailyReset !== today) {
      setLastDailyReset(today);
      setDailyMessagesSent(0);
      setPremiumMessagedUserIds([]);

      // Optionally reset these if you truly want them to be daily-limited
      // setMessagedMatchProfiles([]);
      // setMessagedLikedProfiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────
  //  C) Save to server (and localStorage) whenever changed
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      const newLimits = {
        messagedMatchProfiles,
        messagedLikedProfiles,
        viewedProfiles,
        viewedMatchProfiles,
        premiumMessagesRemaining,
        dailyMessagesSent,
        premiumMessagedUserIds,
      };
      // 1) Save to local storage
      localStorage.setItem("userLimits", JSON.stringify(newLimits));
      // 2) Also post to server
      updateServerLimits(newLimits);
    }
  }, [
    messagedMatchProfiles,
    messagedLikedProfiles,
    viewedProfiles,
    premiumMessagesRemaining,
    dailyMessagesSent,
    isLoading,
    viewedMatchProfiles,
    premiumMessagedUserIds,
  ]);

  const updateServerLimits = async (limits) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      await axiosInstance.post("/users/limits", limits);
    } catch (error) {
      console.error("Error updating user limits on server:", error);
    }
  };

  // ─────────────────────────────────────────
  //  1) Tracking a new "message" attempt
  // ─────────────────────────────────────────
  const trackMessagedProfile = async (profileId, isMatch = false) => {
    if (!profileId) return false;

    let updatedLimits = {};

    if (subscriptionStatus === "premium") {
      if (premiumMessagedUserIds.includes(profileId)) {
        return true;
      } else {
        if (dailyMessagesSent >= PREMIUM_DAILY_MESSAGE_LIMIT) return false;

        setPremiumMessagedUserIds((prev) => {
          const newIds = [...prev, profileId];
          updatedLimits.premiumMessagedUserIds = newIds;
          return newIds;
        });

        setDailyMessagesSent((prev) => {
          const newCount = prev + 1;
          updatedLimits.dailyMessagesSent = newCount;
          return newCount;
        });
        setPremiumMessagesRemaining((prev) => {
          const next = prev - 1;
          updatedLimits.premiumMessagesRemaining = next;
          return next;
        });
      }
    } else {
      if (messagedProfiles.includes(profileId)) {
        return true;
      }

      if (messagedProfiles.length >= FREE_MATCH_MESSAGE_LIMIT) {
        return false;
      }

      setMessagedProfiles((prev) => {
        const newMessaged = [...prev, profileId];
        updatedLimits.messagedProfiles = newMessaged;
        return newMessaged;
      });

      setMessagesSendCount((prev) => {
        const newCount = prev + 1;
        updatedLimits.messagesSendCount = newCount;
        return newCount;
      });

      if (isMatch) {
        setMessagedMatchProfiles((prev) => {
          const updatedMatches = [...prev, profileId];
          updatedLimits.messagedMatchProfiles = updatedMatches;
          return updatedMatches;
        });
      } else {
        setMessagedLikedProfiles((prev) => {
          const updatedLikes = [...prev, profileId];
          updatedLimits.messagedLikedProfiles = updatedLikes;
          return updatedLikes;
        });
      }
    }

    await updateServerLimits({
      messagedMatchProfiles:
        updatedLimits.messagedMatchProfiles || messagedMatchProfiles,
      messagedLikedProfiles:
        updatedLimits.messagedLikedProfiles || messagedLikedProfiles,
      viewedProfiles,
      viewedMatchProfiles,
      premiumMessagesRemaining: updatedLimits.premiumMessagesRemaining ?? premiumMessagesRemaining,
      dailyMessagesSent: updatedLimits.dailyMessagesSent || dailyMessagesSent,
      premiumMessagedUserIds:
        updatedLimits.premiumMessagedUserIds || premiumMessagedUserIds,
      messagesSendCount: updatedLimits.messagesSendCount || messagesSendCount,
      messagedProfiles: updatedLimits.messagedProfiles || messagedProfiles,
    });

    return true;
  };

  // ─────────────────────────────────────────
  //  2) Checking how many messages remain
  // ─────────────────────────────────────────
  const getRemainingMessageCount = () => {
    if (subscriptionStatus === "premium") {
      return premiumMessagesRemaining;
    }
    return FREE_MATCH_MESSAGE_LIMIT - messagedProfiles.length;
  };

  // ─────────────────────────────────────────
  //  3) Tracking a user "view" attempt
  // ─────────────────────────────────────────
  const trackViewedProfile = async (profileId, isMatch = false) => {
    if (!profileId) return false;

    if (subscriptionStatus === "premium") return true;

    let updatedLimits = {};

    if (isMatch) {
      if (viewedMatchProfiles.includes(profileId)) return true;
      if (viewedMatchProfiles.length >= FREE_MATCH_MESSAGE_LIMIT) return false;

      setViewedMatchProfiles((prev) => {
        const newViewed = [...prev, profileId];
        updatedLimits.viewedMatchProfiles = newViewed;
        return newViewed;
      });
    } else {
      if (viewedProfiles.includes(profileId)) return true;
      if (viewedProfiles.length >= FREE_LIKED_MESSAGE_LIMIT) return false;

      setViewedProfiles((prev) => {
        const newViewed = [...prev, profileId];
        updatedLimits.viewedProfiles = newViewed;
        return newViewed;
      });
    }

    await updateServerLimits({
      messagedMatchProfiles,
      messagedLikedProfiles,
      viewedProfiles: updatedLimits.viewedProfiles || viewedProfiles,
      viewedMatchProfiles:
        updatedLimits.viewedMatchProfiles || viewedMatchProfiles,
      premiumMessagesRemaining,
      dailyMessagesSent,
      premiumMessagedUserIds,
      messagesSendCount,
      messagedProfiles,
    });

    return true;
  };

  //  4) Checking if user can message right now
  const canMessageProfile = (profileId, isMatch = false) => {
    if (subscriptionStatus === "premium") {
      return dailyMessagesSent < PREMIUM_DAILY_MESSAGE_LIMIT;
    }

    if (messagedProfiles.includes(profileId)) {
      return true; // Can always message again
    }

    return messagesSendCount < messagesLimit;
  };

  //  5) Checking if user can view a profile
  const canViewProfile = (profileId, isMatch) => {
    if (subscriptionStatus === "premium") return true;

    if (isMatch) {
      // match-cards get their own 4-view limit
      if (viewedMatchProfiles.includes(profileId)) return true;
      return viewedMatchProfiles.length < FREE_MATCH_MESSAGE_LIMIT;
    } else {
      // “Who Liked Me” uses viewedProfiles + messaged arrays + 10-view limit
      if (
        viewedProfiles.includes(profileId) ||
        messagedMatchProfiles.includes(profileId) ||
        messagedLikedProfiles.includes(profileId)
      ) {
        return true;
      }
      return viewedProfiles.length < FREE_LIKED_MESSAGE_LIMIT;
    }
  };

  //  6) Get how many free "views" remain
  const getRemainingViewCount = (isMatch = false) => {
    if (subscriptionStatus === "premium") return Infinity;

    if (isMatch) {
      // 4-limit for matches
      return FREE_MATCH_MESSAGE_LIMIT - viewedMatchProfiles.length;
    } else {
      // 10-limit for "Who Liked Me"
      return FREE_LIKED_MESSAGE_LIMIT - viewedProfiles.length;
    }
  };

  const value = {
    // State
    messagedMatchProfiles,
    messagedLikedProfiles,
    viewedProfiles,
    viewedMatchProfiles,
    subscriptionStatus,
    premiumMessagesRemaining,
    dailyMessagesSent,
    isLoading,

    // Functions
    trackMessagedProfile,
    trackViewedProfile,
    canMessageProfile,
    canViewProfile,
    getRemainingMessageCount,
    getRemainingViewCount,

    // Other
    setWhoLikedMeIds,
    whoLikedMeIds,
    FREE_LIKED_MESSAGE_LIMIT,
    FREE_MATCH_MESSAGE_LIMIT,
    PREMIUM_MONTHLY_MESSAGE_LIMIT,
    PREMIUM_DAILY_MESSAGE_LIMIT,
  };

  return (
    <UserLimitsContext.Provider value={value}>
      {children}
    </UserLimitsContext.Provider>
  );
};

export const useUserLimits = () => {
  const context = useContext(UserLimitsContext);
  if (!context) {
    throw new Error("useUserLimits must be used within a UserLimitsProvider");
  }
  return context;
};
