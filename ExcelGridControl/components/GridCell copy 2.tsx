import React, { useEffect, useRef, useState } from "react";
import { invisibleChar } from "../constants";

interface GridCellProps {
  value: string | number;
  id: string;
  row: number;
  col: number;
  selected: boolean;
  focused: boolean;
  frozen: boolean;
  fileSetCell: boolean;
  hasDropdown: boolean;
  hasUpload: boolean;
  isFormula: boolean;
  isEditable: boolean;
  isTotalRow: boolean;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  textAlign?: "left" | "center" | "right" | "justify";
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseOver: () => void;
  onCellDropDown: (row: string, col: string, isReset?: boolean, isCell?: string) => void;
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
  onFileUpdload: (row: string, col: string) => void;
  onFileView: (row: string, col: string, currVal: string) => void;
  headerVal: string;
  rowIds: Record<number, string>;
  isHighlighted: boolean;
  disabled: boolean;
  isMultiLineInput?: boolean;
  isNumber?: boolean;
}

export const GridCell: React.FC<GridCellProps> = ({ value, row, id, col, selected, focused, frozen, fileSetCell, hasDropdown, hasUpload, isFormula, isEditable, isTotalRow, headerStyle, bodyStyle, textAlign = "center", onMouseDown, onMouseOver, onMouseUp, onContextMenu, onClick, onChange, onFocus, onBlur, startResize, frozenLeft, colRefs, cellRefs, tableRef, onFileUpdload, onFileView, headerVal, onCellDropDown, isHighlighted, disabled, isMultiLineInput = false, isNumber = false }) => {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [isUsing, setIsUsing] = useState(false);

useEffect(() => {
  if(!focused && hasDropdown) {
    if (`${value}`.endsWith(invisibleChar)) {
    onChange(`${value}`.slice(0, -1))
}
else {
  onChange("")
}
  }
  
},[focused,hasDropdown])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!cellRefs.current[row] || !cellRefs.current[row][col]) return;

      const cellElement = cellRefs.current[row][col];

      // If clicked outside the cell, reset
      if (cellElement && !cellElement.contains(event.target as Node)) {
        setIsUsing(false);
      }
    };



    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [row, col, cellRefs]);

  useEffect(() => {
    const cellEl = cellRefs.current[row]?.[col];
    if (!cellEl) return;

    let isMouseDown = false;

    const handlePointerDown = (e: PointerEvent) => {
      isMouseDown = true;

      // If pointerdown happens on this cell => activate
      if (cellEl.contains(e.target as Node)) {
        setIsUsing(true);
      } else {
        setIsUsing(false);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isMouseDown) return;

      const isInside = cellEl.contains(e.target as Node);

      // If dragging INTO this cell => turn on
      if (isInside) {
        setIsUsing(true);
      } else {
        // If dragging OUT => turn off
        setIsUsing(false);
      }
    };

    const handlePointerUp = () => {
      isMouseDown = false;
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [row, col, cellRefs]);


  // ---- Styles ----
  const cellStyle: React.CSSProperties =
    row === 0
      ? {
        background: frozen ? "" : headerStyle?.backgroundColor,
        color: headerStyle?.color,
        fontWeight: headerStyle?.fontWeight,
        fontFamily: headerStyle?.fontFamily,
        fontStyle: headerStyle?.fontStyle,
        borderColor: headerStyle?.borderColor,
        left: frozen ? frozenLeft : 0,
        textAlign: textAlign,
        display: "table-cell",
      }
      : isTotalRow
        ? {
          background: "#f0f7ff",
          fontWeight: "bold",
          borderColor: bodyStyle?.borderColor,
          left: frozen ? frozenLeft : 0,
          textAlign: textAlign,
          display: "table-cell",
        }
        : {
          background: disabled ?  "#dddddd" : bodyStyle?.backgroundColor,
          color: bodyStyle?.color,
          fontWeight: bodyStyle?.fontWeight,
          fontFamily: bodyStyle?.fontFamily,
          fontStyle: bodyStyle?.fontStyle,
          borderColor: bodyStyle?.borderColor,
          cursor: !isEditable ? "not-allowed" : "text",
          left: frozen ? frozenLeft : 0,
          textAlign: textAlign,
          display: "table-cell"
          // height: "44px"
        };

  // ---- Effects ----
  useEffect(() => {
    if (selected) inputRef.current?.focus();
  }, [selected]);

  if (isHighlighted) console.log("Header true", headerVal, isHighlighted);


  // ---- Renderer helpers ----
  const renderHeaderInput = () => (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      value={String(value)}
      // onChange={(e) => onChange(e.target.value)}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      readOnly={!isEditable}
      placeholder="Header"
      className={`excel-input header-input ${selected ? "selected" : ""} ${focused ? "focused" : ""} ${frozen ? "frozen" : ""}`}
      style={{
        boxShadow: isHighlighted ? "inset 0 0 0px 3px #dd0000e5" : "",
        ...cellStyle,
        position: "relative",
        zIndex: selected || focused ? 10 : frozen ? 20 : 0,
        left: "0px",
        textAlign: textAlign,
        height: "100%",
        border: "none",
        background: "transparent"
      }}
    />
  );

  const renderNormalInput = () => {
    if (isNumber) {
      return (
        <input
          type="number"
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          readOnly={!isEditable || isTotalRow}
          className={`excel-input ${selected ? "selected" : ""} ${frozen ? "frozen" : ""}`}
          style={{
            ...cellStyle,
            width: "100%",
            height: "100%",
            border: "none",
            background: "transparent",
            textAlign: "right",
            appearance: "none",
            MozAppearance: "textfield",
            padding: "6px 20px 10px 12px"
          }}
        />
      );
    }

    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={!isEditable || isTotalRow}
        className={`excel-input ${isMultiLineInput ? '' : 'excel-input-fixed-height'} ${selected ? "selected" : ""} ${frozen ? "frozen" : ""} ${hasDropdown ? "dropdown-input" : ""} ${isFormula ? "formula-input" : ""}`}
        style={{
          boxShadow: isHighlighted ? "inset 0 0 0px 3px #dd0000e5" : "",
          ...cellStyle,
          width: "100%",
          resize: "none",
          height: "100%",
          position: "relative",
          zIndex: selected || focused ? 10 : frozen ? 20 : 0,
          left: "0px",
          textAlign: "left",
          border: "none",
          background: "transparent",
        }}
      />
    );
  };


  const renderUploadSection = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background: "white",
        position: "relative",
        top: "-2px",
      }}
    >
      {value === "" ? (
        isEditable ? (
          <button onClick={() => onFileUpdload(String(row), headerVal)} className="file-icon-btn" title="Upload File">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span style={{ fontSize: "12px", color: "#64748b" }}>No file</span>
        )
      ) : (
        <>
          <button onClick={() => onFileView(String(row), headerVal, value as string)} className="file-icon-btn" title="View File">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          {isEditable && (
            <button onClick={() => onFileUpdload(String(row), headerVal)} className="file-icon-btn" title="Replace File">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );

  // ---- Main render ----
  return (
    <td
      className={`excel-cell ${frozen ? "frozen" : ""} ${selected && !isUsing ? "selected" : ""} ${focused ? "focused" : ""} ${hasDropdown ? "dropdown-cell" : ""} ${isFormula ? "formula-cell" : ""} ${!isEditable ? "readonly-cell" : ""} ${isTotalRow ? "total-cell" : ""}`}
      style={{ ...cellStyle, height: "28px" }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(".dropdown-menu")) return;
        setIsUsing(true);
        onMouseDown();
      }}
      onMouseOver={onMouseOver}
      onMouseUp={(e) => { onMouseUp() }}
      onContextMenu={onContextMenu}
      onClick={(e) => {
        onClick(e);
        if (hasDropdown) onCellDropDown(id, headerVal, false, "No"); 
        else onCellDropDown(id, headerVal, false, "Yes");
      }}
      ref={(el) => {
        colRefs.current[col] = el!;
        if (!cellRefs.current[row]) cellRefs.current[row] = [];
        cellRefs.current[row][col] = el!;
      }}
    >
      {/* Resizers */}
      <div className="col-resizer" onMouseDown={(e) => startResize(e, col, true)} />
      <div
        className="row-resizer"
        onMouseDown={(e) => startResize(e, row, false)}
        style={{
          // zIndex: selected || focused ? 0 : 10,
          borderBottom: selected || focused ? "none" : "1px solid #e1e7ff",
        }}
      />

      {/* Content */}
      {row === 0 ? renderHeaderInput() : fileSetCell && !isTotalRow ? renderUploadSection() : renderNormalInput()}

      {hasDropdown && !isTotalRow && (
        <div className="dropdown-arrow" style={{ zIndex: frozen ? 20 : 10 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </td>
  );
};
