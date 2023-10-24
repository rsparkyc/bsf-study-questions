import React from 'react';

export type SettingName = 'fullLessonMode' | 'typeaheadSuggestions' | 'typeaheadApiKey';

export interface Settings {
  fullLessonMode: boolean;
  typeaheadSuggestions: boolean;
  typeaheadApiKey: string;
}

export interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const defaultSettings: Settings = {
  fullLessonMode: false,
  typeaheadSuggestions: false,
  typeaheadApiKey: ''
};

export const defaultSettingsContext: SettingsContextType = {
  settings: defaultSettings,
  setSettings: () => {}
};

const SettingsContext = React.createContext<SettingsContextType>(defaultSettingsContext);

export default SettingsContext;
