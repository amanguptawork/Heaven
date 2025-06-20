import React from 'react';
import { motion } from 'framer-motion';
import { RiHeartsFill, RiMessage3Line } from 'react-icons/ri';

const MatchModal = ({ match, onClose, onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 text-center"
      >
        <RiHeartsFill className="w-20 h-20 text-pink-500 mx-auto mb-6" />
        
        <h2 className="font-fraunces text-3xl text-gray-900 mb-4">
          It's a Match!
        </h2>
        
        <p className="text-gray-600 mb-8">
          You and {match.matchedUser.name} have liked each other
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onStartChat}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl flex items-center gap-2"
          >
            <RiMessage3Line />
            Send Message
          </button>
          
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MatchModal;
