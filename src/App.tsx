import './App.css';

import { AuthContextHolder } from './api/bsf/AuthContext';
import LessonContainer from './components/LessonContainerComponent';
import LoginPage from './components/auth/LoginPage';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(AuthContextHolder.hasAuthContext());

  const handleLoginStateChange = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
  };

  return (
    <div className="App">
      <LoginPage onLoginStateChange={handleLoginStateChange}/>
      { isLoggedIn ?  <LessonContainer />: null }
    </div>
  );
}

export default App;
