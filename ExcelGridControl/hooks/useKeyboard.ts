import { Cell } from "../types";
import { useClipboard } from "./useClipboard";

interface UseKeyboardProps {
  data: Cell[][];
  setData: React.Dispatch<React.SetStateAction<Cell[][]>>;
  selection: any;
  focusedCell: [number, number] | null;
  setFocusedCell: (cell: [number, number] | null) => void;
  setSelection: (selection: any) => void;
  isCellEditable: (row: number, col: number) => boolean;
  hasFormula: (col: number) => boolean;
  hasDropdownOptions: (col: number) => boolean;
  updateFormulas: (data: Cell[][]) => Cell[][];
  getDropdownOptions: (col: number) => string[];
}

export const useKeyboard = ({ data, setData, selection, focusedCell, setFocusedCell, setSelection, isCellEditable, hasFormula, hasDropdownOptions, updateFormulas, getDropdownOptions }: UseKeyboardProps) => {
  const { clipboard, copyFromSystemClipboard, copySelection, cutSelection, pasteData } = useClipboard();

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

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    const range = getSelectedRange();

    // Close dropdown on Escape
    if (e.key === "Escape") {
      return;
    }

    // Tab navigation (Tab and Shift+Tab)
    if (e.key === "Tab") {
      e.preventDefault();
      if (focusedCell) {
        const [row, col] = focusedCell;
        let nextRow = row;
        let nextCol = col;

        if (e.shiftKey) {
          // Shift+Tab: Move to previous cell
          nextCol = col - 1;

          // Move to previous row if at beginning of current row
          if (nextCol < 0) {
            nextRow = row - 1;
            nextCol = data[0].length - 1;
          }

          // If we're at the very beginning, stay at current position
          if (nextRow < 0) {
            nextRow = 0;
            nextCol = 0;
          }
        } else {
          // Tab: Move to next cell (existing logic)
          nextCol = col + 1;

          // Move to next row if at end of current row
          if (nextCol >= data[0].length) {
            nextRow = row + 1;
            nextCol = 0;
          }

          // If we're at the end, add a new row
          if (nextRow >= data.length) {
            setData((prev) => {
              if (prev.length === 0) return prev;

              const lastRow = prev[prev.length - 1];
              const colCount = lastRow.length;

              // Create a new empty row with same number of columns
              const emptyRow = Array(colCount).fill("");

              setFocusedCell([nextRow, nextCol]);
              setSelection({ start: [nextRow, nextCol], end: [nextRow, nextCol] });

              // Return: [all rows except last, empty row, last row]
              return [...prev.slice(0, -1), emptyRow, lastRow];
            });
            return;
          }
        }

        setFocusedCell([nextRow, nextCol]);
        setSelection({ start: [nextRow, nextCol], end: [nextRow, nextCol] });
      }
      return;
    }

    // Arrow key navigation
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      if (focusedCell) {
        const [row, col] = focusedCell;
        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case "ArrowUp":
            newRow = Math.max(0, row - 1);
            break;
          case "ArrowDown":
            newRow = Math.min(data.length - 1, row + 1);
            break;
          case "ArrowLeft":
            newCol = Math.max(0, col - 1);
            break;
          case "ArrowRight":
            newCol = Math.min(data[0].length - 1, col + 1);
            break;
        }

        setFocusedCell([newRow, newCol]);
        setSelection({ start: [newRow, newCol], end: [newRow, newCol] });
      }
      return;
    }

    if (!selection || !range) return;

    // Copy
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      e.preventDefault();
      copySelection(data, range);
    }

    // Cut
    if ((e.ctrlKey || e.metaKey) && e.key === "x") {
      e.preventDefault();
      const newData = cutSelection(data, range, isCellEditable);
      setData(updateFormulas(newData));
    }

    // Paste
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      e.preventDefault();

      // Try to get fresh clipboard data
      const systemClipboard = await copyFromSystemClipboard();
      const clipboardData = systemClipboard || clipboard;

      if (clipboardData) {
        const [sr, sc] = selection.start;
        const newData = pasteData(data, clipboardData, sr, sc, isCellEditable, hasDropdownOptions, hasFormula, getDropdownOptions);
        setData(updateFormulas(newData));
      }
    }

    // Delete
    if (e.key === "Delete") {
      e.preventDefault();
      const newData = data.map((r) => [...r]);
      for (let r = range.top; r <= range.bottom; r++) {
        for (let c = range.left; c <= range.right; c++) {
          if (isCellEditable(r, c)) {
            newData[r][c] = "";
          }
        }
      }
      setData(updateFormulas(newData));
    }
  };

  return {
    handleKeyDown,
  };
};
