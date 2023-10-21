import './App.css';

import SettingsContext, { Settings, defaultSettings } from './context/SettingsContext';

import { AuthContextHolder } from './api/bsf/AuthContext';
import LessonContainer from './components/LessonContainerComponent';
import LoginPage from './components/auth/LoginPage';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(AuthContextHolder.hasAuthContext());
  const [settings, setSettings] = useState<Settings>(defaultSettings);


  const handleLoginStateChange = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <div className="App">
        <LoginPage onLoginStateChange={handleLoginStateChange}/>
        { isLoggedIn ?  <LessonContainer />: null }
      </div>
    </SettingsContext.Provider>
  );
}

export default App;
