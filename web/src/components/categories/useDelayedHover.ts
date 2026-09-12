import { useEffect, useRef, useState } from "react";

/**
 * Tracks a "hovered key" with a grace period before closing, so moving the
 * cursor diagonally from a row toward its flyout submenu (crossing a gap
 * covered by neither element) doesn't close the submenu before the click lands.
 */
export function useDelayedHover(delayMs = 250) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function cancelClose() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function open(key: string) {
    cancelClose();
    setHoveredKey(key);
  }

  function scheduleClose(key: string) {
    cancelClose();
    timeoutRef.current = window.setTimeout(() => {
      setHoveredKey((prev) => (prev === key ? null : prev));
    }, delayMs);
  }

  function closeNow() {
    cancelClose();
    setHoveredKey(null);
  }

  return { hoveredKey, open, scheduleClose, cancelClose, closeNow };
}
