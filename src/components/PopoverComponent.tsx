import "./PopoverComponent.css";

import React, { useState } from 'react';

export const PopoverComponent: React.FC<{ content: string }> = ({ content }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <span 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            🗒️
            {isHovered && (
                <div className="popover-content" dangerouslySetInnerHTML={{__html: content}}>
                </div>
            )}
        </span>
    );
};
