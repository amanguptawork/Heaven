import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiHeartLine,
  RiCloseLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiHomeHeartLine,
  RiTimeLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import SubscriptionModal from "../Subscription/SubscriptionModal";

const MatchCard = ({ match, onSwipe }) => {
  // We store match info in a local state to reflect immediate swipe usage changes on this card.
  const [localMatch, setLocalMatch] = useState(match);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);

  // Sync localMatch with any external changes
  useEffect(() => {
    setLocalMatch(match);
  }, [match]);

  // Gracefully handle the case of no matches
  if (!localMatch || Object.keys(localMatch).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 bg-white rounded-3xl shadow-xl w-full max-w-lg"
      >
        <h3 className="text-2xl font-bold text-purple-600 mb-4">
          No Matches Found
        </h3>
        <p className="text-gray-600">
          We couldn&apos;t find anyone matching your selected filters. Try
          different filter options!
        </p>
      </motion.div>
    );
  }

  // Decrement local swipe, show subscription modal if at 0, and call parent onSwipe
  const handleSwipe = (direction) => {
    if (localMatch.swipesRemaining <= 0) {
      setShowSubscriptionModal(true);
      return;
    }

    setSwipeDirection(direction);

    // Wait for exit animation, then notify parent
    setTimeout(() => onSwipe(direction), 200);
  };

  // Helper to format "Last Active"
  const formatLastActive = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Recently";
      }
      return formatDistanceToNow(date) + " ago";
    } catch (error) {
      return "Recently";
    }
  };

  // Photo navigation
  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === localMatch.photos.length - 1 ? 0 : prev + 1
    );
  };

  const goToPreviousPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? localMatch.photos.length - 1 : prev - 1
    );
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{
          x: swipeDirection === "right" ? 200 : -200,
          opacity: 0,
          transition: { duration: 0.2 },
        }}
        // Add a conditional flaming effect if user is premium
        className={`relative w-full md:aspect-[3/4] max-w-lg rounded-3xl overflow-hidden shadow-2xl md:mt-0 mt-5 ${
          localMatch.subscriptionStatus === "premium"
            ? "premium-flame-effect"
            : ""
        }`}
      >
        {/* Main photo plus gradient overlay */}
        <div className="md:absolute aspect-[3/4] static inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80">
          <motion.img
            key={currentPhotoIndex}
            src={localMatch.photos[currentPhotoIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full object-cover"
            alt={localMatch.fullName}
            /* only make draggable if >1 photo */
            {...(localMatch.photos.length > 1
              ? {
                  drag: "x",
                  dragConstraints: { left: 0, right: 0 },
                  dragElastic: 0.2,
                  onDragEnd: (_, info) => {
                    if (info.offset.x < -50) goToNextPhoto();
                    else if (info.offset.x > 50) goToPreviousPhoto();
                  },
                }
              : {})}
          />

          {/* Photo navigation arrows if multiple photos exist */}
          {localMatch.photos.length > 1 && (
            <>
              <button
                onClick={goToPreviousPhoto}
                className="absolute left-4 md:top-1/2 top-[32%] -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm flex items-center justify-center text-white transition-all"
              >
                <RiArrowLeftSLine className="w-6 h-6" />
              </button>

              <button
                onClick={goToNextPhoto}
                className="absolute right-4 md:top-1/2  top-[32%] -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm flex items-center justify-center text-white transition-all"
              >
                <RiArrowRightSLine className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Photo indicators (dots) */}
        {localMatch.photos.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 px-4">
            {localMatch.photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentPhotoIndex
                    ? "bg-white w-8"
                    : "bg-white/50 w-4"
                }`}
              />
            ))}
          </div>
        )}

        {/* Top status bar (swipes left, match percentage) */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          {/* Swipes left */}
          <div className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {localMatch.swipesRemaining} Likes left
          </div>

          {/* Match percentage */}
        </div>

        {/* Subscription status */}
        <div className="absolute top-5 right-4 bg-gray-800/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          {localMatch.subscriptionStatus === "premium" ? (
            <span className="flex items-center gap-1">
              <img
                src="/premiumhone.png"
                alt="Premium"
                className="w-5 h-5 object-contain"
              />
              Premium
            </span>
          ) : (
            "Free"
          )}
        </div>

        {/* Bottom info panel */}
        <div className="md:absolute static bottom-0 left-0 right-0 p-6 bg-none md:bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="space-y-4">
            {/* Name, Age, Last Active */}
            <div className="flex md:items-end items-start justify-between flex-col md:flex-auto">
              <h3 className="md:text-3xl text-[22px] font-bold md:text-white text-black">
                {localMatch.fullName}, {localMatch.age}
              </h3>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <RiTimeLine />
                <span>{formatLastActive(localMatch.lastActive)}</span>
              </div>
            </div>

            {/* Location, Church, Occupation */}
            <div className="flex flex-wrap gap-4 md:text-white/90 text-black text-sm">
              <div className="flex items-center gap-1">
                <RiMapPinLine />
                <span>{localMatch.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <RiHomeHeartLine />
                <span>
                  {localMatch.churchDenomination?.name || "Not specified"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <RiBriefcaseLine />
                <span>{localMatch.occupation?.title || "Not specified"}</span>
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap gap-2 items-center">
              {Array.isArray(localMatch.interests) &&
                (() => {
                  const all = localMatch.interests;
                  const threshold = 4;
                  const toShow = showAllInterests
                    ? all
                    : all.slice(0, threshold);
                  return (
                    <>
                      {toShow.map((interest, i) => (
                        <span
                          key={`interest-${i}`}
                          className="px-3 py-1 rounded-full text-sm md:bg-white/20 bg-purple-600 text-white backdrop-blur-sm"
                        >
                          {interest}
                        </span>
                      ))}
                      {all.length > threshold && (
                        <button
                          onClick={() => setShowAllInterests((s) => !s)}
                          className="px-3 py-1 rounded-full text-sm font-medium text-purple-600 bg-purple-100 hover:bg-purple-200 transition"
                        >
                          {showAllInterests
                            ? "Show less"
                            : `+${all.length - threshold} more`}
                        </button>
                      )}
                    </>
                  );
                })()}
            </div>

            {/* Like / Dislike buttons (Boost removed) */}
            <div className="flex justify-center gap-6 mt-6 fixed md:static bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/50 to-transparent md:bg-none py-8 md:py-0">
              {/* Dislike button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSwipe("left")}
                className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-red-500/50 text-red-500"
              >
                <RiCloseLine className="w-7 h-7" />
              </motion.button>

              {/* Like button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSwipe("right")}
                className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-green-500/50 text-green-500"
              >
                <RiHeartLine className="w-7 h-7" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string).isRequired,
    churchDenomination: PropTypes.shape({
      name: PropTypes.string,
    }),
    occupation: PropTypes.shape({
      title: PropTypes.string,
    }),
    age: PropTypes.number,
    location: PropTypes.string,
    interests: PropTypes.arrayOf(PropTypes.string),
    lastActive: PropTypes.string,
    matchPercentage: PropTypes.number,
    subscriptionStatus: PropTypes.oneOf(["free", "premium"]),
    swipesRemaining: PropTypes.number,
  }),
  onSwipe: PropTypes.func.isRequired,
};

export default MatchCard;
