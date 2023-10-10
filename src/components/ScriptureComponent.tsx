import './ScriptureComponent.css';

import { ScriptureData } from "../api/bsf/response/AllScripturesResponse";
import { useState } from "react";

interface ScriptureProps {
    scriptureData: ScriptureData;
    verseReferences: string;
}

const Scripture: React.FC<ScriptureProps> = ({ scriptureData, verseReferences}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleScriptureText = () => {
        setIsExpanded(!isExpanded);
    };

    function unescapeString(s: string): string {
        return new Function(`return ${s};`)();
    }

    const transformScriptureContent = (rawHTML: string) => {
        const parsedHTML = new DOMParser().parseFromString(unescapeString(rawHTML), 'text/html');
        
        Array.from(parsedHTML.querySelectorAll('span[data-caller="+"]')).forEach(span => {
            // Create a container for the emoji and popover
            const container = document.createElement('span');
            container.className = 'popover-container';
            
            // Create the notepad emoji span
            const emojiSpan = document.createElement('span');
            emojiSpan.innerText = '🗒️'; // notepad emoji
            emojiSpan.className = 'emoji';
            emojiSpan.onmouseenter = () => { alert('hello'); contentSpan.style.display = 'block'; };
            emojiSpan.onmouseleave = () => { contentSpan.style.display = 'none'; };

            // Move content from span to container and hide it initially
            const contentSpan = document.createElement('span');
            contentSpan.className = 'popover-content';
            contentSpan.style.display = 'none';
            
            while (span.firstChild) {
                contentSpan.appendChild(span.firstChild);
            }
            container.appendChild(contentSpan);
            
            // Add the emoji to the container
            container.insertBefore(emojiSpan, container.firstChild);

            // Replace the original span with the container in the parsed HTML
            span.replaceWith(container);
        });

        // Return the modified outerHTML
        return parsedHTML.body.innerHTML;
    };

    const transformedContent = transformScriptureContent(scriptureData.htmlContent);


    return (
        <div className="scripture">
            <button onClick={toggleScriptureText}>
                {scriptureData.name} {verseReferences}
            </button>
            {isExpanded && 
                <div className="expanded-scripture" dangerouslySetInnerHTML={{ __html: transformedContent}} />
            }
        </div>
    );
}

export default Scripture;
