import { useState } from 'react';
import { Selection } from '../types';

export const useSelection = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null);

  const [selectionStopped,setSelectionStopped] = useState(true)

  const startSelection = (row: number, col: number) => {
    setSelectionStopped(false)

    setSelection({ start: [row, col], end: [row, col] });
    setFocusedCell([row, col]);
    
    
  };

  const endSelection = () => {
     setSelectionStopped(true)
  }

  const extendSelection = (row: number, col: number) => {
     if(selectionStopped) {
   return
    }

    console.log("Not stopped");
    
    if (selection) setSelection({ ...selection, end: [row, col] });
  };

  const getSelectedRange = () => {
    if (!selection) return null;
    const [r1, c1] = selection.start;
    const [r2, c2] = selection.end;
    const top = Math.min(r1, r2);
    const left = Math.min(c1, c2);
    const bottom = Math.max(r1, r2);
    const right = Math.max(c1, c2);
    return { top, left, bottom, right };
  };

  return {
    selection,
    focusedCell,
    setSelection,
    setFocusedCell,
    startSelection,
    endSelection,
    extendSelection,
    getSelectedRange
  };
};