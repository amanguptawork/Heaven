import React from 'react';
import { motion } from 'framer-motion';
import { RiHeartFill, RiMessage2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const MatchCelebrationModal = ({ match, onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleMessageClick = async () => {
    try {
      // Ensure we have valid user IDs
      const currentUserId = localStorage.getItem('userId');
      const targetUserId = match?.targetUser?._id;
      if (!currentUserId || !targetUserId) {
        console.error('Invalid user data:', { currentUserId, targetUserId });
        return;
      }

      // Store the matched user's ID for downstream logic (e.g., Chat.jsx)
      localStorage.setItem('second_person', targetUserId);

      // Create the chat room using participant_1 and participant_2
      const response = await fetch(`${API_URL}/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          participant_1: currentUserId,
          participant_2: targetUserId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Close the modal and navigate to the new chat room
        onClose();
        navigate(`/chat/${data.room._id}`);
      } else {
        console.error('Failed to create chat room:', data);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center"
      >
        <h2 className="text-3xl font-bold mb-6">It's a Match! 🎉</h2>

        <div className="flex justify-center gap-8 mb-8">
          <img
            src={match?.targetUser?.photos?.[0]}
            className="w-32 h-32 rounded-full object-cover"
            alt={match?.targetUser?.fullName || 'Match User'}
          />
        </div>

        <p className="text-xl mb-8">
          You and {match?.targetUser?.fullName} liked each other!
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleMessageClick}
            className="flex-1 py-3 rounded-xl bg-purple-600 text-white"
          >
            <RiMessage2Line className="w-6 h-6 mx-auto" />
            Send Message
          </button>

          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-200">
            Keep Browsing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MatchCelebrationModal;
