import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Cell } from "../types";

export const useResize = (data: Cell[][]) => {
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>({});
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({});
  const colRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [colWidths, setColWidths] = useState<number[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);

  // 🔹 Apply stored dimensions to cells
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    // Apply column widths
    Object.entries(columnWidths).forEach(([colIndex, width]) => {
      const colIdx = parseInt(colIndex);
      table.querySelectorAll(`tr td:nth-child(${colIdx + 1})`).forEach((cell: any) => {
        cell.style.width = `${width}px`;
        cell.style.minWidth = `${width}px`;
      });
    });

    // Apply row heights
    Object.entries(rowHeights).forEach(([rowIndex, height]) => {
      const rowIdx = parseInt(rowIndex);
      const row = table.querySelectorAll("tr")[rowIdx] as HTMLElement;
      if (row) {
        row.style.height = `${height}px`;
        row.querySelectorAll("td").forEach((cell: any) => {
          cell.style.height = `${height}px`;
        });
      }
    });
  }, [data, columnWidths, rowHeights]);

  // 🔹 Start resize handler
  const startResize = useCallback(
    (e: React.MouseEvent, index: number, isCol: boolean) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.pageX;
      const startY = e.pageY;
      const table = tableRef.current;

      if (!table) return;

      let initialWidth = 100;
      let initialHeight = 18;

      if (isCol) {
        const th = table.querySelectorAll("tr:first-child td")[index] as HTMLElement;
        initialWidth = th?.offsetWidth || columnWidths[index] || 100;
      } else {
        const row = table.querySelectorAll("tr")[index] as HTMLElement;
        initialHeight = row?.offsetHeight || rowHeights[index] || 18;
      }

      const onMouseMove = (ev: MouseEvent) => {
        if (isCol) {
          const deltaX = ev.pageX - startX;
          const newWidth = Math.max(50, initialWidth + deltaX);
          setColumnWidths((prev) => ({ ...prev, [index]: newWidth }));
          setColWidths((prev) => {
            const updated = [...prev];
            updated[index] = newWidth;
            return updated;
          });
        } else {
          const deltaY = ev.pageY - startY;
          const newHeight = Math.max(18, initialHeight + deltaY);
          setRowHeights((prev) => ({ ...prev, [index]: newHeight }));
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
      };

      document.body.style.cursor = isCol ? "col-resize" : "row-resize";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [columnWidths, rowHeights]
  );

  // 🔹 Initialize colWidths from actual DOM widths
  useLayoutEffect(() => {
    if (colRefs.current.length > 0) {
      const widths = colRefs.current.map((cell) => cell?.offsetWidth || 0);
      setColWidths(widths);
    }
  }, [data]);

  return {
    columnWidths,
    rowHeights,
    startResize,
    colRefs,
    colWidths,
    setColWidths,
    tableRef,
  };
};
