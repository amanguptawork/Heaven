import React from 'react';

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-gradient-to-r from-[#3F3F94] to-[#B492DE] text-white',
    notification: 'bg-red-500 text-white'
  };

  return (
    <span className={`
      px-2 py-1 text-xs font-medium rounded-full
      ${variants[variant]}
    `}>
      {children}
    </span>
  );
};
