import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const LoadingState = ({ 
  type = 'spinner', 
  size = 'md', 
  text = 'Memuat...', 
  className = '',
  rows = 5,
  columns = 3 
}) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  // Spinner Loading
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
        {text && (
          <p className={`mt-4 ${textSizes[size]} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Dots Loading
  if (type === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full bg-blue-500`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        {text && (
          <p className={`mt-4 ${textSizes[size]} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Card Skeleton
  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="animate-pulse">
              <div className={`h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} rounded w-3/4 mb-3`}></div>
              <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mb-2`}></div>
              <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-2/3`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Form Skeleton
  if (type === 'form') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={`h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/4 mb-2`}></div>
            <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-full`}></div>
          </div>
        ))}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingState;