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

            const deltaX = startX.current - e.clientX; // Inverted because we're resizing from the left
            const newWidth = startWidth.current + deltaX;

            onResize(newWidth);
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
