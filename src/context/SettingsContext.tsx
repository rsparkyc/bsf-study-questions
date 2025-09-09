import React from "react";

export type SettingName =
    | "fullLessonMode"
    | "typeaheadSuggestions"
    | "typeaheadApiKey"
    | "typeaheadLength"
    | "modernNavigation";

export interface Settings {
    fullLessonMode: boolean;
    typeaheadSuggestions: boolean;
    typeaheadApiKey: string;
    typeaheadLength: number;
    modernNavigation: boolean;
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
    modernNavigation: true,
};

export const defaultSettingsContext: SettingsContextType = {
    settings: defaultSettings,
    setSettings: () => {},
};

const SettingsContext = React.createContext<SettingsContextType>(
    defaultSettingsContext
);

export default SettingsContext;
