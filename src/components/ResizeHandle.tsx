import "./ResizeHandle.css";

import React, { useCallback, useRef } from "react";

interface ResizeHandleProps {
    onResize: (width: number) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize }) => {
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current =
            (e.target as HTMLElement).parentElement?.offsetWidth || 350;

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging.current) return;

            // Calculate the distance moved from the start position
            const deltaX = e.clientX - startX.current;
            const newWidth = startWidth.current - deltaX; // Subtract because we're resizing from the left edge

            // Constrain the width to reasonable bounds
            const minWidth = 200;
            const maxWidth = Math.min(800, window.innerWidth * 0.6); // Max 60% of viewport width
            const constrainedWidth = Math.max(
                minWidth,
                Math.min(maxWidth, newWidth)
            );

            onResize(constrainedWidth);
        },
        [onResize]
    );

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, [handleMouseMove]);

    return (
        <div className="resize-handle" onMouseDown={handleMouseDown}>
            <div className="resize-handle-grip"></div>
        </div>
    );
};

export default ResizeHandle;
