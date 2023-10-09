import './App.css';

import { AuthContextHolder } from './api/bsf/AuthContext';
import LessonContainer from './components/LessonContainerComponent';
import LoginPage from './components/auth/LoginPage';

function App() {
  return (
    <div className="App">
      <LoginPage />
      { AuthContextHolder.hasAuthContext() ?  <LessonContainer />: <></> }
    </div>
  );
}

export default App;
