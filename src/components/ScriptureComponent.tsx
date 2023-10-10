import './ScriptureComponent.css';

import { PopoverComponent } from './PopoverComponent';
import React from 'react';
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


    const transformScriptureContent = (nodes: ChildNode[]): React.ReactNode[] => {
        const result: React.ReactNode[] = [];

        nodes.forEach((node, index) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const elem = node as Element;
                const tagName = elem.tagName.toLowerCase();

                const attributes: { [key: string]: any } = {};

                Array.from(elem.attributes).forEach(attr => {
                    if (attr.name === 'class') {
                        attributes.className = attr.value;
                    } else {
                        attributes[attr.name] = attr.value;
                    }
                });

                if (elem.getAttribute('data-caller') === '+') {
                    const content = elem.innerHTML;
                    result.push(<PopoverComponent content={content} />);
                } else {
                    // Recursively process child nodes of this element
                    const children = transformScriptureContent(Array.from(elem.childNodes));
                    const element = React.createElement(tagName, { ...attributes, key: index }, ...children);
                    result.push(element);
                }
            } else {
                result.push(node.textContent || null);
            }
        });

        return result;
    };

    const parsedHTML = new DOMParser().parseFromString(unescapeString(scriptureData.htmlContent), 'text/html');
    const transformedContent = transformScriptureContent(Array.from(parsedHTML.body.childNodes));



    return (
        <div className="scripture">
            <button onClick={toggleScriptureText}>
                {scriptureData.name} {verseReferences}
            </button>
            {isExpanded && 
                <div className="expanded-scripture">
                    {transformedContent}
                </div>
            }
        </div>

    );
}

export default Scripture;
