import React, { useState, useEffect } from 'react';
import { getTokenRemainingTime, isTokenExpiringSoon } from '../../utils/authHelper';

const TokenExpirationTest = () => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const updateTokenInfo = () => {
      setRemainingTime(getTokenRemainingTime());
      setIsExpiringSoon(isTokenExpiringSoon());
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  if (remainingTime <= 0) {
    return null; // Don't show if no token or expired
  }

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
      isExpiringSoon 
        ? 'bg-red-100 border border-red-300 text-red-800' 
        : 'bg-blue-100 border border-blue-300 text-blue-800'
    }`}>
      <div className="text-sm font-medium">
        {isExpiringSoon ? '⚠️ Sesi akan berakhir' : '🕒 Sisa waktu sesi'}
      </div>
      <div className="text-xs">
        {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')} menit
      </div>
    </div>
  );
};

export default TokenExpirationTest;