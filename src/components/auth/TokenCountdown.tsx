import React, { useEffect, useState } from 'react';

import  { AuthContextHolder } from '../../api/bsf/AuthContext';

const TokenCountdown: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (AuthContextHolder.hasAuthContext()) {
      const authContext = AuthContextHolder.getAuthContext(); 
      if (authContext.accessToken) {
        setRemainingTime(authContext.timeRemaining());
      
        const timerId = setInterval(() => {
          setRemainingTime(authContext.timeRemaining());

          if (authContext.timeRemaining() <= 0) {
            clearInterval(timerId);
          }
        }
        , 1000);

        // Clean up
        return () => {
          clearInterval(timerId);
        };

      }

    }
    setRemainingTime(-1);

    // Update every second
  }, []);

  return (
    <div>
      <p>Token expires in: {remainingTime} seconds</p>
    </div>
  );
};

export default TokenCountdown;
