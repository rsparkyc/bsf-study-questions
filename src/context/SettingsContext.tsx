import React from 'react';

export interface Settings {
  fullLessonMode: boolean;
}

export interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const defaultSettings: Settings = {
  fullLessonMode: false,
};

export const defaultSettingsContext: SettingsContextType = {
  settings: defaultSettings,
  setSettings: () => {}
};

const SettingsContext = React.createContext<SettingsContextType>(defaultSettingsContext);

export default SettingsContext;
