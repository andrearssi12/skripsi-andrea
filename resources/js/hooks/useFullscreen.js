import { useCallback, useEffect, useState } from "react";

export default function useFullscreen(elementRef) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        const element = elementRef.current;
        if (!element) return;

        if (!document.fullscreenElement) {
            element.requestFullscreen?.().catch(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen?.().catch(() => setIsFullscreen(false));
        }
    }, [elementRef]);

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
            window.setTimeout(
                () => window.dispatchEvent(new Event("resize")),
                150,
            );
        };

        document.addEventListener("fullscreenchange", handleChange);
        document.addEventListener("webkitfullscreenchange", handleChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleChange);
            document.removeEventListener(
                "webkitfullscreenchange",
                handleChange,
            );
        };
    }, []);

    return { isFullscreen, toggleFullscreen };
}
