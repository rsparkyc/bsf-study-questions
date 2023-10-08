import './App.css';

import { AccessToken, AuthContextHolder } from './api/bsf/AuthContext';
import { useEffect, useState } from 'react';

import Login from './components/auth/Login';
import TestEndpoint from './components/LessonContainerComponent';
import TokenCountdown from './components/auth/TokenCountdown';

const isTokenValid = (token: AccessToken): boolean => {
  return true;
}


function App() {

  const [accessToken, setAccessToken] = useState(() => {
    const storedToken = localStorage.getItem('accessToken');
    return storedToken ? JSON.parse(storedToken) : null;
  });

  useEffect(() => {
    const tokenItem = localStorage.getItem('accessToken');
    if (tokenItem) {
      const parsedToken = JSON.parse(tokenItem);
      if (!isTokenValid(parsedToken)) {
        localStorage.removeItem('accessToken'); // Remove invalid token from storage
        setAccessToken(null);
      } else {
        setAccessToken(parsedToken);
      }
    }
  }, []);

  return (
    <div className="App">
      <Login setAccessToken={setAccessToken} existingAccessToken={accessToken} />
      <textarea disabled id='tokenTextArea' value={JSON.stringify(accessToken, null, 2)}></textarea>
      <TokenCountdown/>
      <TestEndpoint accessToken={accessToken} />
    </div>
  );
}

export default App;
