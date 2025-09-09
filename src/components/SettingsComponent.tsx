import "./SettingsComponent.css";

import React, { useContext, useEffect, useState } from "react";
import SettingsContext, {
    SettingName,
    defaultSettings,
} from "../context/SettingsContext";

const SettingsComponent: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, setSettings } = useContext(SettingsContext);

    // Load settings from localStorage
    useEffect(() => {
        const savedSetting = localStorage.getItem("settings");
        if (savedSetting) {
            const loadedSettings = JSON.parse(savedSetting);
            setSettings({ ...defaultSettings, ...loadedSettings });
        }
    }, [setSettings]);

    const toggleSettings = () => {
        setIsOpen(!isOpen);
    };

    const handleCheckboxChange = (settingName: SettingName) => {
        return () => {
            const newSettingValue = !settings[settingName];
            const newSettings = { ...settings, [settingName]: newSettingValue };
            setSettings(newSettings);
            localStorage.setItem("settings", JSON.stringify(newSettings));
        };
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
                                checked={settings.fullLessonMode}
                                onChange={handleCheckboxChange(
                                    "fullLessonMode"
                                )}
                            />
                            Full Lesson Mode
                        </label>
                    </div>
                    <div className="settings-content">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.modernNavigation}
                                onChange={handleCheckboxChange(
                                    "modernNavigation"
                                )}
                            />
                            Modern Navigation
                        </label>
                    </div>
                    <div className="settings-content">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.typeaheadSuggestions}
                                onChange={handleCheckboxChange(
                                    "typeaheadSuggestions"
                                )}
                            />
                            Typeahead Suggestions
                        </label>

                        {settings.typeaheadSuggestions && (
                            <>
                                <div>
                                    <label>
                                        API Key:
                                        <input
                                            id="typeahead-api-key"
                                            type="password"
                                            placeholder="Enter API Key"
                                            value={settings.typeaheadApiKey}
                                            onChange={(e) => {
                                                const newSettings = {
                                                    ...settings,
                                                    typeaheadApiKey:
                                                        e.target.value,
                                                };
                                                setSettings(newSettings);
                                                localStorage.setItem(
                                                    "settings",
                                                    JSON.stringify(newSettings)
                                                );
                                            }}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        Typeahead length:
                                        <input
                                            id="typeahead-length"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={settings.typeaheadLength}
                                            onChange={(e) => {
                                                const newSettings = {
                                                    ...settings,
                                                    typeaheadLength:
                                                        Number.parseInt(
                                                            e.target.value
                                                        ),
                                                };
                                                setSettings(newSettings);
                                                localStorage.setItem(
                                                    "settings",
                                                    JSON.stringify(newSettings)
                                                );
                                            }}
                                        />
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={toggleSettings}>Close</button>
                </div>
            )}
        </div>
    );
};

export default SettingsComponent;
