import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { RiHeartFill, RiTimeLine, RiMapPinLine } from 'react-icons/ri';

const TopMatchesCarousel = ({ matches }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const containerRef = useRef(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Matches</h2>
      
      {/* Navigation Buttons */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
      >
        <RiArrowLeftSLine className="w-6 h-6 text-gray-700" />
      </button>
      
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
      >
        <RiArrowRightSLine className="w-6 h-6 text-gray-700" />
      </button>

      <div 
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
      >
        <div className="flex gap-4">
          {matches.map((match) => (
            <motion.div
              key={match._id}
              whileHover={{ y: -5 }}
              onHoverStart={() => setHoveredId(match._id)}
              onHoverEnd={() => setHoveredId(null)}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-32 h-40 md:w-40 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-purple-50 to-purple-100">
                  <motion.img
                    src={match.photos[0]}
                    alt={match.fullName}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Compatibility Score */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -bottom-3 -right-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg"
                >
                  {Math.round(match.matchScore)}% Match
                </motion.div>

                {/* Online Status */}
                {Date.now() - new Date(match.lastActive) < 900000 && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                )}

                {/* Hover Info Card */}
                <AnimatePresence>
                  {hoveredId === match._id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -bottom-24 left-0 right-0 bg-white rounded-xl p-3 shadow-xl"
                    >
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <RiMapPinLine /> {match.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <RiTimeLine />
                        {formatDistanceToNow(new Date(match.lastActive), { addSuffix: true })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-gray-900">
                  {match.fullName.split(' ')[0]}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-purple-600">
                  <RiHeartFill />
                  <span>{match.interests?.[0]}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopMatchesCarousel;
