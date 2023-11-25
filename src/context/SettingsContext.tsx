import React from "react";

export type SettingName =
    | "fullLessonMode"
    | "typeaheadSuggestions"
    | "typeaheadApiKey"
    | "typeaheadLength";

export interface Settings {
    fullLessonMode: boolean;
    typeaheadSuggestions: boolean;
    typeaheadApiKey: string;
    typeaheadLength: number;
}

export interface SettingsContextType {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const defaultSettings: Settings = {
    fullLessonMode: false,
    typeaheadSuggestions: false,
    typeaheadApiKey: "",
    typeaheadLength: 20,
};

export const defaultSettingsContext: SettingsContextType = {
    settings: defaultSettings,
    setSettings: () => {},
};

const SettingsContext = React.createContext<SettingsContextType>(
    defaultSettingsContext
);

export default SettingsContext;
