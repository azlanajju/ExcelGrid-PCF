import { useState } from 'react';
import { Cell } from '../types';
import Papa from "papaparse";

export const useClipboard = () => {
  const [clipboard, setClipboard] = useState<Cell[][] | null>(null);


const copyFromSystemClipboard = async (): Promise<Cell[][] | null> => {
  try {
    const text = await navigator.clipboard.readText();
    // Parse as TSV (tab-delimited)
    const parsed = Papa.parse<Cell[]>(text, {
      delimiter: "\t",
      newline: "\r\n", // Excel uses CRLF
      quoteChar: '"'
    });
    setClipboard(parsed.data);
    return parsed.data;
  } catch (err) {
    console.log("Clipboard access denied, falling back to manual copy");
    return null;
  }
};


  const pasteToSystemClipboard = async (data: Cell[][]): Promise<void> => {
    try {
      const text = data.map(row => row.join('\t')).join('\n');
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.log('Clipboard write access denied');
    }
  };

  const copySelection = (data: Cell[][], range: { top: number; left: number; bottom: number; right: number }): Cell[][] => {
    const block = data
      .slice(range.top, range.bottom + 1)
      .map(r => r.slice(range.left, range.right + 1));
    setClipboard(block);
    pasteToSystemClipboard(block);
    return block;
  };

  const cutSelection = (data: Cell[][], range: { top: number; left: number; bottom: number; right: number }, isCellEditable: (row: number, col: number) => boolean): Cell[][] => {
    const block = copySelection(data, range);
    
    // Clear the selected cells
    const newData = data.map(r => [...r]);
    for (let r = range.top; r <= range.bottom; r++) {
      for (let c = range.left; c <= range.right; c++) {
        if (isCellEditable(r, c)) {
          newData[r][c] = "";
        }
      }
    }
    
    return newData;
  };

  const pasteData = (
    data: Cell[][],
    clipboardData: Cell[][],
    startRow: number,
    startCol: number,
    isCellEditable: (row: number, col: number) => boolean,
    hasDropdownOptions: (col: number) => boolean,
    hasFormula: (col: number) => boolean
  ): Cell[][] => {
    const newData = data.map(row => [...row]);
    
    // Ensure we have enough rows and columns
    const neededRows = startRow + clipboardData.length;
    const maxColsInClipboard = Math.max(...clipboardData.map(row => row.length));
    const neededCols = startCol + maxColsInClipboard;
    const currentColCount = newData[0]?.length || 0;

    // Add rows if needed
    while (newData.length < neededRows) {
      newData.push(new Array(currentColCount).fill(""));
    }

    // Add columns if needed
    if (currentColCount < neededCols) {
      const colsToAdd = neededCols - currentColCount;
      for (let i = 0; i < newData.length; i++) {
        if (!newData[i]) {
          newData[i] = new Array(currentColCount).fill("");
        }
        for (let j = 0; j < colsToAdd; j++) {
          newData[i].push("");
        }
      }
    }

    // Paste data only to editable cells
    for (let i = 0; i < clipboardData.length; i++) {
      for (let j = 0; j < (clipboardData[i]?.length || 0); j++) {
        const targetRow = startRow + i;
        const targetCol = startCol + j;

        if (targetRow < newData.length &&
            targetCol < newData[targetRow].length &&
            isCellEditable(targetRow, targetCol)) {
          newData[targetRow][targetCol] = clipboardData[i][j];
        }
      }
    }

    // Validate dropdown columns (but skip header row and formula columns)
    for (let i = 0; i < clipboardData.length; i++) {
      for (let j = 0; j < (clipboardData[i]?.length || 0); j++) {
        const targetRow = startRow + i;
        const targetCol = startCol + j;

        if (targetRow === 0 || hasFormula(targetCol)) continue;

        if (targetRow < newData.length &&
            targetCol < newData[targetRow].length &&
            hasDropdownOptions(targetCol)) {
          const currentValue = String(newData[targetRow][targetCol] || "");
          const options = hasDropdownOptions(targetCol) ? [] : []; // You'd need to get actual options here
          if (!options.includes(currentValue) && currentValue !== "") {
            console.warn(`Invalid value "${currentValue}" for dropdown column ${targetCol}. Clearing cell.`);
            newData[targetRow][targetCol] = "";
          }
        }
      }
    }

    return newData;
  };

  return {
    clipboard,
    setClipboard,
    copyFromSystemClipboard,
    pasteToSystemClipboard,
    copySelection,
    cutSelection,
    pasteData
  };
};