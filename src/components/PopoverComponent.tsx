import "./PopoverComponent.css";

import React, { useState } from 'react';

export const PopoverComponent: React.FC<{ content: string }> = ({ content }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            🗒️
            {isHovered && (
                <div className="popover-content">
                    {content}
                </div>
            )}
        </div>
    );
};
