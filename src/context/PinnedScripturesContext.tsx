import React, { ReactNode, createContext, useContext, useState } from "react";

import { ScriptureData } from "../api/bsf/response/AllScripturesResponse";

export interface PinnedScripture {
    id: string;
    scriptureData: ScriptureData;
    verseReferences: string;
}

interface PinnedScripturesContextType {
    pinnedScriptures: PinnedScripture[];
    pinScripture: (
        scriptureData: ScriptureData,
        verseReferences: string
    ) => void;
    unpinScripture: (id: string) => void;
    isPinned: (
        scriptureData: ScriptureData,
        verseReferences: string
    ) => boolean;
    getPinnedScriptureId: (
        scriptureData: ScriptureData,
        verseReferences: string
    ) => string | null;
    panelWidth: number;
    setPanelWidth: (width: number) => void;
}

const PinnedScripturesContext = createContext<
    PinnedScripturesContextType | undefined
>(undefined);

export const PinnedScripturesProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [pinnedScriptures, setPinnedScriptures] = useState<PinnedScripture[]>(
        []
    );
    const [panelWidth, setPanelWidth] = useState<number>(350);

    const generateId = (
        scriptureData: ScriptureData,
        verseReferences: string
    ): string => {
        return `${scriptureData.scriptureId}-${verseReferences}`;
    };

    const pinScripture = (
        scriptureData: ScriptureData,
        verseReferences: string
    ) => {
        const id = generateId(scriptureData, verseReferences);
        const existingIndex = pinnedScriptures.findIndex((ps) => ps.id === id);

        if (existingIndex === -1) {
            setPinnedScriptures((prev) => [
                ...prev,
                {
                    id,
                    scriptureData,
                    verseReferences,
                },
            ]);
        }
    };

    const unpinScripture = (id: string) => {
        setPinnedScriptures((prev) => prev.filter((ps) => ps.id !== id));
    };

    const isPinned = (
        scriptureData: ScriptureData,
        verseReferences: string
    ): boolean => {
        const id = generateId(scriptureData, verseReferences);
        return pinnedScriptures.some((ps) => ps.id === id);
    };

    const getPinnedScriptureId = (
        scriptureData: ScriptureData,
        verseReferences: string
    ): string | null => {
        const id = generateId(scriptureData, verseReferences);
        const pinned = pinnedScriptures.find((ps) => ps.id === id);
        return pinned ? pinned.id : null;
    };

    return (
        <PinnedScripturesContext.Provider
            value={{
                pinnedScriptures,
                pinScripture,
                unpinScripture,
                isPinned,
                getPinnedScriptureId,
                panelWidth,
                setPanelWidth,
            }}
        >
            {children}
        </PinnedScripturesContext.Provider>
    );
};

export const usePinnedScriptures = (): PinnedScripturesContextType => {
    const context = useContext(PinnedScripturesContext);
    if (context === undefined) {
        throw new Error(
            "usePinnedScriptures must be used within a PinnedScripturesProvider"
        );
    }
    return context;
};
