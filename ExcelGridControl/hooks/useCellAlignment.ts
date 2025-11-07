import { useCallback, useState } from "react";

export interface CellAlignment {
  textAlign: "left" | "center" | "right" | "justify";
}

export const useCellAlignment = () => {
  const [cellAlignments, setCellAlignments] = useState<Record<string, CellAlignment>>({});

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getCellAlignment = useCallback(
    (row: number, col: number): CellAlignment => {
      const key = getCellKey(row, col);
      return cellAlignments[key] || { textAlign: "center" };
    },
    [cellAlignments]
  );

  const setTextAlign = useCallback((row: number, col: number, align: "left" | "center" | "right" | "justify") => {
    const key = getCellKey(row, col);
    setCellAlignments((prev) => ({
      ...prev,
      [key]: {
        textAlign: align,
      },
    }));
  }, []);

  return {
    getCellAlignment,
    setTextAlign,
  };
};
