import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Login from './components/auth/Login';
import './App.css';
import { AccessToken } from './api/bsf/AuthContext';
import TokenCountdown from './components/auth/TokenCountdown';
import Person from './components/PersonComponent';

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
      <Login setAccessToken={setAccessToken} />
      <textarea disabled id='tokenTextArea' value={JSON.stringify(accessToken, null, 2)}></textarea>
      <TokenCountdown accessToken={accessToken} />
      <Person accessToken={accessToken} />
    </div>
  );
}

export default App;
