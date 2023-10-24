import './TypeaheadTextarea.css';

import React, { useCallback, useState } from 'react';

import debounce from 'lodash.debounce';

type Props = {
  generateSuggestions: (input: string, context: any) => Promise<string[]>;
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
    onChange}) => {
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
      ghostTextareaRef.current.scrollTop = mainTextareaRef.current.scrollTop;
    }
  }, [ghostValue]); // Only re-run the effect if ghostValue changes


  const fetchSuggestions = useCallback(debounce(async (input: string) => {
    if (input === "") {
      setGhostValue("");
    }
    else {
      const suggestions = await generateSuggestions(input, suggestionsContext);
      const match = suggestions.find(s => s.startsWith(input));
      setGhostValue(match || "");
    }
  }, debounceTime), [generateSuggestions, suggestionsContext]);


  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = event.target.value;
    
    // Check if the user is continuing to type the suggestion
    if (ghostValue.startsWith(val) && val !== "") {
      setInputValue(val);
      // No need to do anything else, just let them continue typing
    } else {
      setInputValue(val);
      setGhostValue("");  // Clear the ghost input quickly

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
  };

  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
    React.useEffect(() => {
    if (mainTextareaRef.current && ghostTextareaRef.current) {
      // Initialize the ResizeObserver
      resizeObserverRef.current = new ResizeObserver(() => {
        const mainTextareaStyle = window.getComputedStyle(mainTextareaRef.current!);
        if (ghostTextareaRef.current?.style) {
          ghostTextareaRef.current.style.width = mainTextareaStyle.width;
          ghostTextareaRef.current.style.height = mainTextareaStyle.height;
        }
      });

      // Start observing the main textarea
      resizeObserverRef.current.observe(mainTextareaRef.current);

      // Cleanup
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, []);



  return (
    <div className="textarea-wrapper">
      <textarea
        ref={mainTextareaRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={"typeahead-input" + (additionalClassNames ? " " + additionalClassNames : "")}
        rows={rows}
        onScroll={handleScroll} // Attach the scroll event handler
        {...(columns ? { cols: columns } : {})}
        {...(placeholder ? { placeholder: placeholder } : {})}
      />
      <textarea
        ref={ghostTextareaRef}
        value={ghostValue}
        disabled
        className={"typeahead-ghost" + (additionalClassNames ? " " + additionalClassNames : "")}
        rows={rows}
        {...(columns ? { cols: columns } : {})}
      />
    </div>
  );
};
