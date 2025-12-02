import React from "react";
import { GridCell } from "./GridCell";

export const GridTable: any = ({ 
  data, selection, focusedCell, frozenCols, fileSetCells, numberCols, multiLineCols, 
  configData, tableEditable, headerStyle, bodyStyle, 
  onCellClick, onCellChange, onCellFocus, onContextMenu, onMouseDown, 
  onMouseUp, onMouseOver, startResize, hasDropdownOptions, hasFormula, 
  hasUpload, getFormula, validateAndCorrectValue, isCellEditable, colWidths, 
  getFrozenLeft, tableRef, colRefs, cellRefs, conversionConfig, onFileUpdload, 
  onFileView, onCellDropDown, rowIds, getCellAlignment, cellHighlight, cellsDisabled, 
  checkDropDown, ...props 
}) => {

  const getSelectedRange = () => {
    if (!selection) return null;
    const [r1, c1] = selection.start;
    const [r2, c2] = selection.end;
    return { 
      top: Math.min(r1, r2), left: Math.min(c1, c2), 
      bottom: Math.max(r1, r2), right: Math.max(c1, c2) 
    };
  };

  const range = getSelectedRange();
  const headerRow = data[0];

  return (
    <table className="excel-table" ref={tableRef}>
      <tbody className="table-body">
        {data.map((row, rIdx) => {
          const isTotalRow = row[0] === "Total";
          
          return (
            <tr key={rIdx} className={isTotalRow ? "total-row" : ""}>
              {row.map((cell, cIdx) => {
                const headerVal = headerRow[cIdx] as string;
                
                // Pre-calculate booleans
                // Optimization: Using Set.has is faster than Array.indexOf for large datasets, 
                // but for 100 rows indexOf is acceptable.
                const highlighted = cellHighlight.indexOf(headerVal + ";" + rIdx) !== -1;
                const disabled = cellsDisabled.indexOf(headerVal + ";" + rIdx) !== -1;
                
                // Optimization: Simple boolean checks
                const selected = range ? (rIdx >= range.top && rIdx <= range.bottom && cIdx >= range.left && cIdx <= range.right) : false;
                const focused = focusedCell ? (focusedCell[0] === rIdx && focusedCell[1] === cIdx) : false;
                
                const isEditableVal = isCellEditable(rIdx, cIdx) && !disabled;
                const hasDropdown = rIdx > 0 && hasDropdownOptions(cIdx) && !hasFormula(cIdx) && isEditableVal;
                const isFormulaVal = hasFormula(cIdx);
                const cellHasUpload = hasUpload(cIdx);
                const alignment = getCellAlignment(rIdx, cIdx);

                // Note: We pass `onMouseDown` directly, not `() => onMouseDown(...)`
                // The GridCell will invoke it with (rIdx, cIdx)
                return (
                  <GridCell 
                    key={`${rIdx}-${cIdx}`} // Better key stability
                    value={cell} 
                    id={String(rIdx)} 
                    row={rIdx} 
                    col={cIdx} 
                    
                    // State Props
                    selected={selected} 
                    focused={focused} 
                    frozen={frozenCols.includes(cIdx)} 
                    fileSetCell={fileSetCells.includes(cIdx)} 
                    hasDropdown={hasDropdown} 
                    hasUpload={cellHasUpload} 
                    isFormula={isFormulaVal} 
                    isEditable={isEditableVal} 
                    isTotalRow={isTotalRow} 
                    isHighlighted={highlighted} 
                    disabled={disabled} 
                    isMultiLineInput={multiLineCols.includes(cIdx)} 
                    isNumber={numberCols.includes(cIdx)}
                    
                    // Style Props
                    headerStyle={headerStyle} 
                    bodyStyle={bodyStyle} 
                    textAlign={alignment.textAlign} 
                    frozenLeft={frozenCols.includes(cIdx) ? getFrozenLeft(cIdx) : 0} 
                    
                    // Function Props (Pass references directly!)
                    onMouseDown={onMouseDown} 
                    onMouseUp={onMouseUp} 
                    onMouseOver={onMouseOver} 
                    onContextMenu={onContextMenu} 
                    onClick={onCellClick} // Map onClick to onCellClick
                    onChange={onCellChange} 
                    onFocus={onCellFocus} 
                    onBlur={validateAndCorrectValue} // Map onBlur to validate
                    
                    // Utils
                    checkDropDown={checkDropDown}
                    onCellDropDown={onCellDropDown}
                    startResize={startResize} 
                    formula={isFormulaVal ? getFormula(cIdx) : undefined} 
                    colRefs={colRefs} 
                    cellRefs={cellRefs} 
                    //tableRef={tableRef} // Note: Usually tableRef isn't needed in every cell, check if removable
                    onFileUpdload={onFileUpdload} 
                    onFileView={onFileView} 
                    headerVal={headerVal} 
                    rowIds={rowIds} 
                  />
                );
              })} 
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};