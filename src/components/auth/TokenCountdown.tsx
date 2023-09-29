import React, { useEffect, useState } from 'react';
import { AccessToken } from '../../api/bsf/AuthContext';

interface TokenCountdownProps {
  accessToken: AccessToken;
}

const TokenCountdown: React.FC<TokenCountdownProps> = ({ accessToken }) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Calculate initial time difference
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    setRemainingTime(accessToken.expires_on - now);

    // Update every second
    const timerId = setInterval(() => {
      const newNow = Math.floor(Date.now() / 1000);
      const newRemainingTime = accessToken.expires_on - newNow;
      setRemainingTime(newRemainingTime);

      if (newRemainingTime <= 0) {
        clearInterval(timerId);
      }
    }, 1000);

    // Clean up
    return () => {
      clearInterval(timerId);
    };
  }, [accessToken]);

  return (
    <div>
      <p>Token expires in: {remainingTime} seconds</p>
    </div>
  );
};

export default TokenCountdown;
