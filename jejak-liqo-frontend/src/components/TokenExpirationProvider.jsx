import React from 'react';
import { useTokenExpiration } from '../hooks/useTokenExpiration';
import TokenExpirationModal from './TokenExpirationModal';

const TokenExpirationProvider = ({ children }) => {
  const {
    showExpirationModal,
    showWarningModal,
    remainingTime,
    handleLoginRedirect,
    handleCloseWarning
  } = useTokenExpiration();
  
  return (
    <>
      {children}
      
      {/* Token Expiration Modal */}
      <TokenExpirationModal
        isOpen={showExpirationModal}
        type="expired"
        onLoginRedirect={handleLoginRedirect}
      />
      
      {/* Token Warning Modal */}
      <TokenExpirationModal
        isOpen={showWarningModal}
        type="warning"
        remainingTime={remainingTime}
        onClose={handleCloseWarning}
        onLoginRedirect={handleLoginRedirect}
      />
    </>
  );
};

export default TokenExpirationProvider;