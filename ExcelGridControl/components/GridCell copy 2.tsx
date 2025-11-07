import React, { Ref, useEffect, useRef, useState } from 'react';

interface GridCellProps {
  value: string | number;
  row: number;
  col: number;
  selected: boolean;
  focused: boolean;
  frozen: boolean;
  hasDropdown: boolean;
  hasUpload: boolean;
  isFormula: boolean;
  isEditable: boolean;
  isTotalRow: boolean;
  headerStyle?: any;
  bodyStyle?: any;
  onMouseDown: () => void;
  onMouseUp: () => void
  onMouseOver: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  startResize: (e: React.MouseEvent, index: number, isCol: boolean) => void;
  formula?: string;
  frozenLeft: number;
  colRefs: React.RefObject<HTMLTableCellElement[]>;
  cellRefs: React.RefObject<HTMLTableCellElement[][]>;
  tableRef: React.RefObject<HTMLTableElement>;
  conversionConfig?: Record<number, [number, number]>;
}

export const GridCell: React.FC<GridCellProps> = ({
  value,
  row,
  col,
  selected,
  focused,
  frozen,
  hasDropdown,
  hasUpload,
  isFormula,
  isEditable,
  isTotalRow,
  headerStyle,
  bodyStyle,
  onMouseDown,
  onMouseOver,
  onMouseUp,
  onContextMenu,
  onClick,
  onChange,
  onFocus,
  onBlur,
  startResize,
  formula,
  frozenLeft,
  colRefs,
  cellRefs,
  tableRef,
  conversionConfig
}) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const cellStyle = row === 0 ? {
    background: frozen ? headerStyle?.headerBackgroundColorFrozen : headerStyle?.backgroundColor,
    color: headerStyle?.color,
    fontWeight: headerStyle?.fontWeight,
    fontFamily: headerStyle?.fontFamily,
    fontStyle: headerStyle?.fontStyle,
    borderColor: headerStyle?.borderColor,
    left: frozen ? frozenLeft : 0
  } : isTotalRow ? {
    background: '#f0f7ff',
    fontWeight: 'bold',
    borderColor: bodyStyle?.borderColor,
    left: frozen ? frozenLeft : 0,
  } : {
    background: bodyStyle?.backgroundColor,
    color: bodyStyle?.color,
    fontWeight: bodyStyle?.fontWeight,
    fontFamily: bodyStyle?.fontFamily,
    fontStyle: bodyStyle?.fontStyle,
    borderColor: bodyStyle?.borderColor,
    cursor: !isEditable ? 'not-allowed' : 'text',
    left: frozen ? frozenLeft : 0,
  };

  function computeConverted(val: string | number, factors: [number, number]) {
  const num = parseFloat(String(val));
  if (isNaN(num)) return "";
  return (num * (factors[1] / factors[0])).toString();
}


  function getPosition() {
    const cellElement = cellRefs.current?.[row]?.[col];
    const tableElement = tableRef.current;

    if (!cellElement || !tableElement) return 0

    const cellRect = cellElement.getBoundingClientRect();
    const tableRect = tableElement.getBoundingClientRect();
    // console.log("Vals",cellRect,tableRect,cellRect.left - tableRect.left);


    // Calculate position relative to the table container
    return cellRect.left - tableRect.left
  }




  useEffect(() => {
    getPosition()
  }, [frozen])

  useEffect(() => {
    if (selected) inputRef.current?.focus();
  }, [selected]);


    const conversion = conversionConfig?.[col];


  return (
    <td
      className={`excel-cell ${frozen ? "frozen" : ""} ${selected ? "selected" : ""} ${focused ? "focused" : ""} ${hasDropdown ? "dropdown-cell" : ""} ${isFormula ? "formula-cell" : ""} ${!isEditable ? "readonly-cell" : ""} ${isTotalRow ? "total-cell" : ""}`}
      style={{
        ...cellStyle, height: "36px",
        left: frozen ? frozenLeft : 0
      }}
      onMouseDown={(e) => {
  if ((e.target as HTMLElement).closest(".dropdown-menu")) return;
  onMouseDown();
}}

      onMouseOver={onMouseOver}
      onMouseUp={() => { onMouseUp() }}
      onContextMenu={onContextMenu}
      onClick={onClick}

      ref={el => {
        colRefs.current[col] = el;
        if (!cellRefs.current[row]) cellRefs.current[row] = [];
        cellRefs.current[row][col] = el;

      }}
    >
      <div
        className="col-resizer"
        onMouseDown={(e) => startResize(e, col, true)}
      />
      <div
        className="row-resizer"
        onMouseDown={(e) => startResize(e, row, false)}
      />

      {row === 0 ? (
  // Header cell stays same
  <input
    ref={inputRef as unknown as React.RefObject<HTMLInputElement>}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={onFocus}
    className={`excel-input ${selected ? "selected" : ""} ${focused ? "focused" : ""} header-input ${frozen ? "frozen" : ""} ${hasDropdown ? "dropdown-input" : ""} ${isFormula ? "formula-input" : ""}`}
    placeholder="Header"
    onBlur={onBlur}
    readOnly={!isEditable}
    style={cellStyle}
  />
) : conversion ? (
  // ✅ Dual textareas (conversion mode)
  <div style={{ display: "flex", flexDirection: "column" }}>
    <textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      className="excel-input"
      onBlur={onBlur}
      readOnly={!isEditable || isTotalRow}
      style={{ ...cellStyle, width: "100%" }}
    />
    <textarea
      value={computeConverted(value, conversion)}
      readOnly
      className="excel-input readonly-cell"
      style={{ ...cellStyle, width: "100%", background: "#f9f9f9", color: "#555" }}
    />
  </div>
) : (
  // Normal cell
  <textarea
    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={onFocus}
    className={`excel-input ${selected ? "selected" : ""} ${frozen ? "frozen" : ""} ${hasDropdown ? "dropdown-input" : ""} ${isFormula ? "formula-input" : ""}`}
    onBlur={onBlur}
    readOnly={!isEditable || isTotalRow}
    style={{ ...cellStyle, width: "100%" }}
  />
)}


      {hasDropdown && !isTotalRow && (
        <div className="dropdown-arrow">▼</div>
      )}

      {/* {isFormula && row > 0 && (
        <div className="formula-indicator" title={`Formula: ${formula}`}>
          ƒx
        </div>
      )} */}
    </td>
  );
};