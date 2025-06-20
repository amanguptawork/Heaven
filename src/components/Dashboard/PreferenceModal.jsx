import React from 'react';
import { motion } from 'framer-motion';
import { RiHeartLine, RiUserHeartLine, RiGroupLine } from 'react-icons/ri';
import { updateUserPreferences } from '../../api/matches';


const PreferenceModal = ({ onSelect }) => {
  const preferences = [
    {
      id: 'marriage',
      title: 'Marriage Focused',
      description: 'Seeking a God-centered marriage with someone who shares my faith values',
      icon: RiHeartLine
    },
    {
      id: 'courtship',
      title: 'Christian Courtship',
      description: 'Looking to build a meaningful relationship with marriage in mind',
      icon: RiUserHeartLine
    },
    {
      id: 'fellowship',
      title: 'Faith Fellowship',
      description: 'Interested in making friends who share my Christian values',
      icon: RiGroupLine
    }
  ];
  const handlePreferenceSelect = async (preferenceId) => {
    try {
      const preferences = {
        relationshipIntent: preferenceId,
        ageRange: { min: 18, max: 65 }, // Default age range
        denominationPreference: 'any',
        locationPreference: { maxDistance: 100 }
      };
      
      await updateUserPreferences(preferences);
      onSelect(preferenceId);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4"
      >
        <h2 className="font-fraunces text-3xl text-primary mb-6 text-center">
          What brings you to Heaven on Earth Connections?
        </h2>
        
        <div className="space-y-4">
          {preferences.map((pref) => (
            <motion.button
              key={pref.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePreferenceSelect(pref.id)}

              className="w-full p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-500 
                         flex items-start gap-4 transition-colors text-left"
            >
              <pref.icon className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-fraunces text-xl text-gray-900 mb-2">{pref.title}</h3>
                <p className="text-gray-600">{pref.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PreferenceModal;
