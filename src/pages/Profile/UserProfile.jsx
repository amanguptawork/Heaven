import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  RiMessageLine,
  RiMapPinLine,
  RiCalendarLine,
  RiPsychotherapyLine,
  RiHomeHeartLine,
  RiBriefcaseLine,
  RiCloseLine,
  RiVideoAddLine,
} from "react-icons/ri";
import { getUserProfile } from "../../api/profile";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../context/SocketContext";

const UserProfile = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const socket = useSocket();
  const { userId } = useParams();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error = null,
  } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    onError: (error) => {
      console.error("Profile fetch error:", error);
    },
    onSuccess: (data) => {
      console.log("Profile data received:", data);
    },
  });

  const profile = data?.data;

  useEffect(() => {
    if (roomId && socket) {
      socket.emit("join_chat", {
        participant_1: user?.id,
        participant_2: userId,
      });
    }

    if (socket) {
      socket.on("connect", () => console.log("Socket connected"));
      socket.on("error", (error) => console.error("Socket error:", error));

      return () => {
        socket.off("connect");
        socket.off("error");
      };
    }
  }, [userId, user, roomId, socket]);

  // Enhanced error handling
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          Error loading profile: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    console.log("Profile data is null or undefined:", data);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  // Calculate match percentage if not provided
  const matchPercentage = profile.matchPercentage || 85; // Default or calculated value

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="h-screen overflow-y-auto w-full">
        {/* Hero Section - Clean Modern Design */}
        <div className="relative py-10 bg-gradient-to-br from-indigo-900 to-purple-700">
          {/* Content Overlay */}
          <div className="inset-0 flex flex-col justify-center p-8">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between md:items-center md:flex-col xl:flex-row md:gap-5 xl:gap-0 flex-col items-start"
              >
                <div className="flex gap-4 md:flex-row flex-col w-full">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={profile?.photos[0]}
                      alt={profile?.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                  <div className="text-white flex-1 flex gap-5 xl:items-center justify-between flex-col xl:flex-row items-start">
                    <div>
                      <motion.h1
                        className="xl:text-6xl font-bold mb-4 font-fraunces md:text-4xl text-2xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {profile.fullName}
                      </motion.h1>
                      <div className="flex items-center gap-6 xl:text-lg">
                        <motion.span
                          className="flex items-center gap-2 flex-1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <RiMapPinLine className="w-5 h-5" />
                          {profile.location}
                        </motion.span>
                        <motion.span
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          <RiCalendarLine className="w-5 h-5" />
                          {profile.age} years old
                        </motion.span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        localStorage.setItem("second_person", userId);

                        // Get current user data, prioritizing the id field
                        const currentUser =
                          user || JSON.parse(localStorage.getItem("userData"));
                        const currentUserId =
                          currentUser?.id || currentUser?._id;

                        // Debug logging
                        console.log("Current user data:", {
                          fromContext: user,
                          fromStorage: localStorage.getItem("userData"),
                          resolvedId: currentUserId,
                        });

                        if (!currentUserId) {
                          alert("Please log in to continue");
                          return;
                        }

                        try {
                          const authToken = localStorage.getItem("authToken");
                          const response = await fetch(`${API_URL}/chat/room`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({
                              participant_1: currentUserId,
                              participant_2: userId, // Using the route param userId
                            }),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            console.error(
                              "Chat room creation failed:",
                              errorData
                            );
                            throw new Error(
                              errorData.message || "Failed to create chat room"
                            );
                          }

                          const data = await response.json();
                          if (data.success) {
                            setRoomId(data.room._id);
                            navigate(`/chat/${data.room._id}`);
                          }
                        } catch (error) {
                          console.error("Error creating chat room:", error);
                          alert(
                            "Unable to create chat room. Please try again."
                          );
                        }
                      }}
                      className="
bg-white hover:bg-white 
text-purple-500 px-8 py-3 rounded-xl font-semibold 
flex items-center gap-2 shadow-lg transition-colors
"
                    >
                      <RiMessageLine className="w-5 h-5" />
                      Message
                    </motion.button>
                  </div>
                </div>

                {/* <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      localStorage.setItem("second_person", userId);

                      // Get current user data, prioritizing the id field
                      const currentUser =
                        user || JSON.parse(localStorage.getItem("userData"));
                      const currentUserId = currentUser?.id || currentUser?._id;

                      // Debug logging
                      console.log("Current user data:", {
                        fromContext: user,
                        fromStorage: localStorage.getItem("userData"),
                        resolvedId: currentUserId,
                      });

                      if (!currentUserId) {
                        alert("Please log in to continue");
                        return;
                      }

                      try {
                        const authToken = localStorage.getItem("authToken");
                        const response = await fetch(`${API_URL}/chat/room`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                          },
                          body: JSON.stringify({
                            participant_1: currentUserId,
                            participant_2: userId, // Using the route param userId
                          }),
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          console.error(
                            "Chat room creation failed:",
                            errorData
                          );
                          throw new Error(
                            errorData.message || "Failed to create chat room"
                          );
                        }

                        const data = await response.json();
                        if (data.success) {
                          setRoomId(data.room._id);
                          navigate(`/chat/${data.room._id}`);
                        }
                      } catch (error) {
                        console.error("Error creating chat room:", error);
                        alert("Unable to create chat room. Please try again.");
                      }
                    }}
                    className="
bg-white hover:bg-white 
text-purple-500 px-8 py-3 rounded-xl font-semibold 
flex items-center gap-2 shadow-lg transition-colors
"
                  >
                    <RiMessageLine className="w-5 h-5" />
                    Message
                  </motion.button>
                </div> */}
              </motion.div>
            </div>
          </div>

          {/* Photo Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {profile.photos.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                onClick={() => setActivePhotoIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activePhotoIndex
                    ? "w-8 bg-white"
                    : "w-4 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-12">
            {[
              {
                icon: RiPsychotherapyLine,
                label: "Personality",
                value: profile.personalityType,
                strength:
                  matchPercentage >= 90
                    ? "Exceptional Match"
                    : matchPercentage >= 80
                    ? "Strong Match"
                    : matchPercentage >= 70
                    ? "Good Match"
                    : matchPercentage >= 60
                    ? "Moderate Match"
                    : "Low Match",
              },
              {
                icon: RiHomeHeartLine,
                label: "Denomination",
                value: profile.churchDenomination?.name,
              },
              {
                icon: RiBriefcaseLine,
                label: "Occupation",
                value: profile.occupation?.title,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
              >
                <stat.icon className="w-10 h-10 text-purple-500 mb-3" />
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className="text-xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                {stat.strength && (
                  <div className="text-xl font-semibold text-gray-900">
                    {stat.strength}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap break-words">
              {profile.about}
            </p>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>
            <div className="grid grid-cols-3 gap-6">
              {profile.photos.map((photo, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer
                             shadow-sm hover:shadow-md transition-all"
                  onClick={() => {
                    setActivePhotoIndex(index);
                    setShowGallery(true);
                  }}
                >
                  <img
                    src={photo}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          {profile.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Videos</h2>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm">
                    <video
                      src={profile.videoUrl}
                      controls
                      className="w-64 rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interests</h2>
            <div className="flex flex-wrap gap-3">
              {profile.interests.map((interest, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl text-base
                             font-medium hover:bg-purple-200 transition-colors cursor-default"
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            <button
              onClick={() => setShowGallery(null)}
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
            <motion.img
              src={profile.photos[activePhotoIndex]}
              className="max-w-full max-h-[90vh] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
