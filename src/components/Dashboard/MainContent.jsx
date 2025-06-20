import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatches, handleSwipe } from "../../api/matches";
import MatchCard from "./MatchCard";
import { RiFilterLine } from "react-icons/ri";
import FilterModal from "./FilterModal";

const MainContent = () => {
  // State Management
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    interests: [],
    distance: 100,
    ageRange: { min: 18, max: 65 },
  });

  const queryClient = useQueryClient();

  // Query and Mutations
  const {
    data: matches = [],
    isLoading,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ["matches", filters],
    queryFn: () => getMatches(filters),
    staleTime: 30000,

    // Add these two lines (or customize the time if you want more/less frequent):
    refetchOnWindowFocus: true,
    refetchInterval: 15000, // e.g. re-fetch every 60 secs
  });

  const swipeMutation = useMutation({
    mutationFn: handleSwipe,
    onSuccess: async (data) => {
      console.log("[SWIPE MUTATION] Response from server:", data);

      if (typeof data.swipesRemaining === "number") {
        queryClient.setQueryData(["matches", filters], (oldMatches) => {
          if (!oldMatches) return oldMatches;

          const updated = oldMatches.map((match) => ({
            ...match,
            // Force entire array to have the latest swipesRemaining
            swipesRemaining: data.swipesRemaining,
          }));

          console.log(
            "[SWIPE MUTATION] Updating local matches array with new swipesRemaining:",
            data.swipesRemaining
          );
          return updated;
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (matches.length === 1) {
        queryClient.setQueryData(["matches", filters], []);
      } else if (currentMatchIndex < matches.length - 1) {
        setCurrentMatchIndex((prev) => prev + 1);
      } else {
        await refetchMatches();
        setCurrentMatchIndex(0);
      }
    },

    onError: (error) => {
      console.error("Swipe error:", error);
    },
  });

  // Handler Functions
  const handleFilterUpdate = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    setCurrentMatchIndex(0); // Reset to first match when filters change
  };

  const handleSwipeAction = (direction) => {
    if (!currentMatch) return;
    swipeMutation.mutate({
      targetUserId: currentMatch._id,
      direction,
    });
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
  };

  const handleRefreshMatches = async () => {
    await refetchMatches();
    setCurrentMatchIndex(0);
  };

  const currentMatch = matches[currentMatchIndex];

  return (
    <div className="flex-1 p-8 flex flex-col items-center md:justify-center justify-start ju min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Filter Button */}
      <div className="w-full max-w-4xl flex justify-end mt-6">
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
        >
          <RiFilterLine className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl">
        <div className="flex justify-center items-center min-h-[600px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500"
              >
                <p className="text-xl mb-4">Loading matches...</p>
              </motion.div>
            ) : currentMatch ? (
              <MatchCard
                key={currentMatch._id}
                match={currentMatch}
                onSwipe={handleSwipeAction}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500"
              >
                <p className="text-xl mb-4">No more matches available</p>
                <button
                  onClick={handleRefreshMatches}
                  className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  Refresh Matches
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showFilterModal && (
          <FilterModal
            currentFilters={filters}
            onClose={() => setShowFilterModal(false)}
            onApply={handleFilterUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainContent;
