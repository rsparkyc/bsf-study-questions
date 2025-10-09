import "./PinnedScripturesPanel.css";

import {
    PinnedScripture,
    usePinnedScriptures,
} from "../context/PinnedScripturesContext";

import React from "react";
import ResizeHandle from "./ResizeHandle";
import Scripture from "./ScriptureComponent";

const PinnedScripturesPanel: React.FC = () => {
    const { pinnedScriptures, unpinScripture, panelWidth, setPanelWidth } =
        usePinnedScriptures();

    if (pinnedScriptures.length === 0) {
        return null;
    }

    return (
        <div
            className="pinned-scriptures-panel"
            style={{ width: `${panelWidth}px` }}
        >
            <ResizeHandle onResize={setPanelWidth} />
            <div className="pinned-scriptures-header">
                <h3>Pinned Scriptures</h3>
            </div>
            <div className="pinned-scriptures-content">
                {pinnedScriptures.map((pinnedScripture: PinnedScripture) => (
                    <div
                        key={pinnedScripture.id}
                        className="pinned-scripture-item"
                    >
                        <Scripture
                            scriptureData={pinnedScripture.scriptureData}
                            verseReferences={pinnedScripture.verseReferences}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PinnedScripturesPanel;
