import './TypeaheadTextarea.css';

import React, { useState } from 'react';

type Props = {
  suggestions: string[];
  additionalClassNames?: string;
  rows?: number;
  columns?: number;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export const TypeaheadTextarea: React.FC<Props> = ({ suggestions, additionalClassNames, rows, columns, placeholder, defaultValue, onChange}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [ghostValue, setGhostValue] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = event.target.value;
    setInputValue(val);
    if (val === "") {
      setGhostValue("");
    }
    else {
      const match = suggestions.find(s => s.startsWith(val));
      setGhostValue(match || "");
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
    }
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event.target.value);
    } 
  }

  return (
    <div className="textarea-wrapper">
      <textarea
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleOnBlur}
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
