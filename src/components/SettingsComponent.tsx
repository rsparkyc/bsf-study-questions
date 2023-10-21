import './SettingsComponent.css';

import React, { useContext, useEffect, useState } from 'react';

import SettingsContext from '../context/SettingsContext';

const SettingsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullLessonMode, setFullLessonMode] = useState(false);
  const { settings, setSettings } = useContext(SettingsContext);


  // Load settings from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem('settings');
    if (savedSetting) {
      setFullLessonMode(JSON.parse(savedSetting).fullLessonMode);
    }
  }, []);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = () => {
    const newSetting = !fullLessonMode;
    setFullLessonMode(newSetting);

    const newSettings = { ...settings, fullLessonMode: newSetting};
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  return (
    <div className="settings-component">
      <div className="settings-icon" onClick={toggleSettings}>
        <i className="fa fa-cog fa-1-5x"></i>
      </div>
      {isOpen && (
        <div className="settings-menu">
          <div className="settings-content">
            <label>
              <input
                type="checkbox"
                checked={fullLessonMode}
                onChange={handleCheckboxChange}
              />
              Full Lesson Mode
            </label>
          </div>
          <button onClick={toggleSettings}>Close</button>
        </div>
      )}
    </div>
  );
};

export default SettingsComponent;
