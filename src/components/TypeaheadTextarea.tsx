import "./TypeaheadTextarea.css";

import React, { useCallback, useMemo, useState } from "react";

import StringUtils from "../utils/StringUtils";
import debounce from "lodash.debounce";

type Props = {
    generateSuggestions: (
        input: string,
        context: any
    ) => Promise<Array<string>>;
    suggestionsContext: any;
    suggestionsDebounceTime?: number;
    additionalClassNames?: string;
    rows?: number;
    columns?: number;
    placeholder?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
};

export const TypeaheadTextarea: React.FC<Props> = ({
    generateSuggestions,
    suggestionsContext,
    suggestionsDebounceTime,
    additionalClassNames,
    rows,
    columns,
    placeholder,
    defaultValue,
    onChange,
}) => {
    const [inputValue, setInputValue] = useState<string>(defaultValue || "");
    const [ghostValue, setGhostValue] = useState<string>("");

    const debounceTime = suggestionsDebounceTime || 0;

    const mainTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const ghostTextareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
        if (ghostTextareaRef.current) {
            ghostTextareaRef.current.scrollTop = event.currentTarget.scrollTop;
        }
    };

    // Watch for changes in ghostValue
    React.useEffect(() => {
        if (mainTextareaRef.current && ghostTextareaRef.current) {
            ghostTextareaRef.current.scrollTop =
                mainTextareaRef.current.scrollTop;
        }
    }, [ghostValue]); // Only re-run the effect if ghostValue changes

    const debouncedGenerateSuggestions = useMemo(
        () =>
            debounce(
                async (
                    input: string,
                    setGhost: any,
                    textareaElement: HTMLTextAreaElement
                ) => {
                    // Check if the textarea is still focused, if not then don't do anything
                    if (document.activeElement !== textareaElement) {
                        return;
                    }

                    if (input === "") {
                        setGhost("");
                    } else {
                        const suggestions = await generateSuggestions(
                            input,
                            suggestionsContext
                        );
                        // Check if the textarea is still focused, if not then abort
                        if (document.activeElement !== textareaElement) {
                            return;
                        }
                        console.log("suggestions", suggestions);

                        const finalSuggestions = suggestions.map((suggestion) =>
                            StringUtils.combineStrings(input, suggestion)
                        );
                        console.log("final suggestions", finalSuggestions);

                        if (finalSuggestions.length > 0) {
                            setGhost(finalSuggestions[0]);
                        } else {
                            setGhost("");
                        }
                    }
                },
                debounceTime
            ),
        [generateSuggestions, suggestionsContext, debounceTime]
    );

    const fetchSuggestions = useCallback(
        (input: string) => {
            debouncedGenerateSuggestions(
                input,
                setGhostValue,
                mainTextareaRef.current!
            );
        },
        [debouncedGenerateSuggestions]
    );

    const handleInputChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const val = event.target.value;

        // Check if the user is continuing to type the suggestion
        if (ghostValue.startsWith(val) && val !== "") {
            setInputValue(val);
            // No need to do anything else, just let them continue typing
        } else {
            setInputValue(val);
            setGhostValue(""); // Clear the ghost input quickly

            // Fetch suggestions using the debounced function
            fetchSuggestions(val);
        }

        if (onChange) {
            onChange(val);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.code === "Tab" && ghostValue) {
            event.preventDefault();
            setInputValue(ghostValue);
            setGhostValue("");
            if (onChange) {
                onChange(ghostValue);
            }
        }
        if (event.code === "Escape" && ghostValue) {
            event.preventDefault();
            setGhostValue("");
        }
        // if they hit the right arrow key, we want to accept the next letter of the suggestion,
        // and move the cursor over
        if (event.code === "ArrowRight" && ghostValue) {
            setInputValue(ghostValue.slice(0, inputValue.length + 1));
        }
    };

    // Rely on CSS for sizing overlay; no JS width/height syncing needed

    return (
        <div className="textarea-wrapper">
            <textarea
                ref={mainTextareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setGhostValue("")}
                className={
                    "typeahead-input" +
                    (additionalClassNames ? " " + additionalClassNames : "")
                }
                rows={rows}
                onScroll={handleScroll} // Attach the scroll event handler
                {...(columns ? { cols: columns } : {})}
                {...(placeholder ? { placeholder: placeholder } : {})}
            />
            <textarea
                ref={ghostTextareaRef}
                value={ghostValue}
                disabled
                className={
                    "typeahead-ghost" +
                    (additionalClassNames ? " " + additionalClassNames : "")
                }
                rows={rows}
                {...(columns ? { cols: columns } : {})}
            />
        </div>
    );
};
