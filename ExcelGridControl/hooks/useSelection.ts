import { useState, useCallback, useRef } from 'react';
import { Selection } from '../types';

export const useSelection = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null);

  // We keep this state if you need it for UI rendering elsewhere
  const [selectionStopped, setSelectionStopped] = useState(true);

  // OPTIMIZATION: Use a Ref to track dragging status instantly without triggering re-renders
  // or forcing function recreation.
  const isSelectingRef = useRef(false);

  // 1. Start Selection (Stable - No dependencies)
  const startSelection = useCallback((row: number, col: number) => {
    isSelectingRef.current = true; // Update Ref
    setSelectionStopped(false);    // Update State (triggers render)

    setSelection({ start: [row, col], end: [row, col] });
    setFocusedCell([row, col]);
  }, []); // Empty dependency array = Stable function

  // 2. End Selection (Stable - No dependencies)
  const endSelection = useCallback(() => {
    // Only trigger updates if we were actually selecting
    if (isSelectingRef.current) {
      console.log("Selection stopped");
      isSelectingRef.current = false;
      setSelectionStopped(true);
    }
  }, []);

  // 3. Extend Selection (CRITICAL OPTIMIZATION)
  // This function runs on every mouse move. It MUST remain stable.
  const extendSelection = useCallback((row: number, col: number) => {
    // Check the Ref (synchronous, fresh value) instead of state
    if (!isSelectingRef.current) {
      return;
    }

    // Use "Functional State Update" (prev => ...) so we don't need 'selection' in dependencies
    setSelection((prev) => {
      if (!prev) return null;
      
      // Optimization: Don't update state if the coordinates haven't actually changed
      // (This reduces React render cycles during mouse jitter)
      if (prev.end[0] === row && prev.end[1] === col) {
        return prev;
      }

      return { ...prev, end: [row, col] };
    });
  }, []);

  // 4. Get Range Helper
  const getSelectedRange = useCallback(() => {
    // Note: Since this reads 'selection' from closure, it technically depends on it.
    // However, usually this is called during render or calculation, not passed as a callback prop to cells.
    if (!selection) return null;
    
    const [r1, c1] = selection.start;
    const [r2, c2] = selection.end;
    const top = Math.min(r1, r2);
    const left = Math.min(c1, c2);
    const bottom = Math.max(r1, r2);
    const right = Math.max(c1, c2);
    return { top, left, bottom, right };
  }, [selection]);

  return {
    selection,
    focusedCell,
    selectionStopped, // Return the state variable for UI usage
    setSelection,
    setFocusedCell,
    startSelection,
    endSelection,
    extendSelection,
    getSelectedRange
  };
};