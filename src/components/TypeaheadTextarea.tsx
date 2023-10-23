import './TypeaheadTextarea.css';

import React, { useState } from 'react';

import debounce from 'lodash.debounce';

type Props = {
  generateSuggestions: (input: string) => Promise<string[]>;
  suggestionsDebounceTime?: number;
  additionalClassNames?: string;
  rows?: number;
  columns?: number;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export const TypeaheadTextarea: React.FC<Props> = ({ generateSuggestions, suggestionsDebounceTime, additionalClassNames, rows, columns, placeholder, defaultValue, onChange}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [ghostValue, setGhostValue] = useState<string>("");

  const debounceTime = suggestionsDebounceTime || 0;
  const fetchSuggestions = debounce(async (input: string) => {
    if (input === "") {
      setGhostValue("");
    }
    else {
      const suggestions = await generateSuggestions(input);
      const match = suggestions.find(s => s.startsWith(input));
      setGhostValue(match || "");
    }
  }, debounceTime); 


  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = event.target.value;
    console.log("handleInputChange: " + val);
    
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


  return (
    <div className="textarea-wrapper">
      <textarea
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={"typeahead-input" + (additionalClassNames ? " " + additionalClassNames : "")}
        rows={rows}
        {...(columns ? { cols: columns } : {})}
        {...(placeholder ? { placeholder: placeholder } : {})}
        {...(defaultValue ? { defaultValue: defaultValue } : {})}

      />
      <textarea
        value={ghostValue}
        disabled
        className={"typeahead-ghost" + (additionalClassNames ? " " + additionalClassNames : "")}
        rows={rows}
        {...(columns ? { cols: columns } : {})}
      />
    </div>
  );
};
