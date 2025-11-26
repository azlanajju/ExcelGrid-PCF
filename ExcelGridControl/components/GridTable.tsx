import React, { useEffect } from "react";
import { Cell, ConversionConfig } from "../types";
import { GridCell } from "./GridCell";

interface GridTableProps {
  data: Cell[][];
  selection: any;
  focusedCell: [number, number] | null;
  frozenCols: number[];
  fileSetCells: number[];
  numberCols: number[];
  multiLineCols: number[];
  configData: any;
  tableEditable: boolean;
  headerStyle: any;
  bodyStyle: any;
  onCellClick: (row: number, col: number, e: React.MouseEvent) => void;
  onCellChange: (row: number, col: number, value: string) => void;
  onFileUpdload: (row: string, col: string) => void;
  onFileView: (row: string, col: string, currVal: string) => void;
  onCellFocus: (row: number, col: number) => void;
  onCellDropDown: (row: string, col: string) => void;
  onContextMenu: (e: React.MouseEvent, row: number, col: number) => void;
  onMouseDown: (row: number, col: number) => void;
  onMouseUp: () => void;
  onMouseOver: (row: number, col: number) => void;
  startResize: (e: React.MouseEvent, index: number, isCol: boolean) => void;
  hasDropdownOptions: (col: number) => boolean;
  hasFormula: (col: number) => boolean;
  getFormula: (col: number) => string;
  hasUpload: (col: number) => boolean;
  validateAndCorrectValue: (row: number, col: number) => void;
  isCellEditable: (row: number, col: number) => boolean;
  colWidths: number[];
  getFrozenLeft: (cIdx: number) => number;
  tableRef: React.RefObject<HTMLTableElement>;
  colRefs: React.RefObject<HTMLTableCellElement[]>;
  cellRefs: React.RefObject<HTMLTableCellElement[][]>;
  conversionConfig: ConversionConfig;
  rowIds: Record<number, string>;
  getCellAlignment: (row: number, col: number) => { textAlign: "left" | "center" | "right" | "justify" };
  cellHighlight : string[];
  cellsDisabled: string[];
}

export const GridTable: React.FC<GridTableProps> = ({ data, selection, focusedCell, frozenCols, fileSetCells,numberCols,multiLineCols, configData, tableEditable, headerStyle, bodyStyle, onCellClick, onCellChange, onCellFocus, onContextMenu, onMouseDown, onMouseUp, onMouseOver, startResize, hasDropdownOptions, hasFormula, hasUpload, getFormula, validateAndCorrectValue, isCellEditable, colWidths, getFrozenLeft, tableRef, colRefs, cellRefs, conversionConfig, onFileUpdload, onFileView, onCellDropDown, rowIds, getCellAlignment, cellHighlight,cellsDisabled,  ...props }) => {
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

  const range = getSelectedRange();
  const headerRow = data[0];

  useEffect(()=>{
    console.log("multiLineCols",multiLineCols,numberCols);
    
  },[multiLineCols,numberCols])

  return (
    <table className="excel-table" ref={tableRef}>
      <tbody className="table-body">
        {data.map((row, rIdx) => {
          return (
            <tr key={rIdx} className={row[0] === "Total" ? "total-row" : ""}>
              {row.map((cell, cIdx) => {
                const headerVal = headerRow[cIdx] as string;

                const highlighted = cellHighlight.indexOf(headerVal + ";" + rIdx) !== -1;
                const disabled = cellsDisabled.indexOf(headerVal + ";" + rIdx) !== -1;
                const selected = range && rIdx >= range.top && rIdx <= range.bottom && cIdx >= range.left && cIdx <= range.right;
                const focused = focusedCell && focusedCell[0] === rIdx && focusedCell[1] === cIdx;
                const isEditable = isCellEditable(rIdx, cIdx) && !disabled;
                const hasDropdown = hasDropdownOptions(cIdx) && rIdx > 0 && !hasFormula(cIdx) && isEditable;
                const isFormula = hasFormula(cIdx);
                const cellHasUpload = hasUpload(cIdx);
                const isTotalRow = row[0] === "Total";
                const alignment = getCellAlignment(rIdx, cIdx);

                return <GridCell key={cIdx} value={cell} id={String(rIdx)} row={rIdx} col={cIdx} selected={selected} 
                focused={focused} frozen={frozenCols.includes(cIdx)} fileSetCell={fileSetCells.includes(cIdx)} 
                hasDropdown={hasDropdown} hasUpload={cellHasUpload} isFormula={isFormula} isEditable={isEditable} 
                isTotalRow={isTotalRow} headerStyle={headerStyle} rowIds={rowIds} bodyStyle={bodyStyle} textAlign={alignment.textAlign} 
                onMouseDown={() => onMouseDown(rIdx, cIdx)} onMouseUp={onMouseUp} onCellDropDown={onCellDropDown} 
                onMouseOver={() => onMouseOver(rIdx, cIdx)} onContextMenu={(e) => onContextMenu(e, rIdx, cIdx)} 
                onClick={(e) => onCellClick(rIdx, cIdx, e)} onChange={(value) => onCellChange(rIdx, cIdx, value)} 
                onFocus={() => onCellFocus(rIdx, cIdx)} onBlur={() => validateAndCorrectValue(rIdx, cIdx)} 
                startResize={startResize} formula={isFormula ? getFormula(cIdx) : undefined} 
                frozenLeft={frozenCols.includes(cIdx) ? getFrozenLeft(cIdx) : 0} colRefs={colRefs} cellRefs={cellRefs} 
                tableRef={tableRef} onFileUpdload={onFileUpdload} onFileView={onFileView} headerVal={headerVal} 
                isHighlighted={highlighted} disabled={disabled} isMultiLineInput={multiLineCols.includes(cIdx)} isNumber={numberCols.includes(cIdx)} {...props} />;
              })} 
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
