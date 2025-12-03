import React, { useEffect, useRef, useState } from "react";

// Define interface
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
  // Parent functions passed down
  onMouseDown: (row: number, col: number) => void;
  onMouseUp: () => void;
  onMouseOver: (row: number, col: number) => void;
  onContextMenu: (e: React.MouseEvent, row: number, col: number) => void;
  onClick: (e: React.MouseEvent, row: number, col: number) => void;
  onChange: (row: number, col: number, value: string) => void;
  onFocus: (row: number, col: number) => void;
  onBlur: (row: number, col: number) => void;
  checkDropDown: (stringVal: string) => boolean;
  onCellDropDown: (row: string, col: string, isReset?: boolean, isCell?: string) => void;
  startResize: (e: React.MouseEvent, index: number, isCol: boolean) => void;
  formula?: string;
  frozenLeft: number;
  colRefs: React.RefObject<HTMLTableCellElement[]>;
  cellRefs: React.RefObject<HTMLTableCellElement[][]>;
  onFileUpdload: (row: string, col: string) => void;
  onFileView: (row: string, col: string, currVal: string) => void;
  headerVal: string;
  rowIds: Record<number, string>;
  isHighlighted: boolean;
  disabled: boolean;
  isMultiLineInput?: boolean;
  isNumber?: boolean;
}

const GridCellComponent: React.FC<GridCellProps> = ({
  value, row, id, col, selected, focused, frozen, fileSetCell, hasDropdown, hasUpload,
  isFormula, isEditable, isTotalRow, headerStyle, bodyStyle, textAlign = "center",
  onMouseDown, onMouseOver, onMouseUp, onContextMenu, onClick, onChange, onFocus, onBlur,
  startResize, frozenLeft, colRefs, cellRefs, onFileUpdload, onFileView,
  headerVal, onCellDropDown, isHighlighted, disabled, isMultiLineInput = false,
  isNumber = false, checkDropDown
}) => {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // 1. Local State to force re-render on MouseUp
  const [mouseUpTrigger, setMouseUpTrigger] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  useEffect(() => {
    if (selected && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [selected]);

  // Memoized Styles
  const cellStyle: React.CSSProperties = React.useMemo(() => {
    const base = {
      left: frozen ? frozenLeft : 0,
      textAlign: textAlign,
      display: "table-cell",
    };

    if (row === 0) {
      return {
        ...base,
        background: frozen ? "" : headerStyle?.backgroundColor,
        color: headerStyle?.color,
        fontWeight: headerStyle?.fontWeight,
        fontFamily: headerStyle?.fontFamily,
        fontStyle: headerStyle?.fontStyle,
        borderColor: headerStyle?.borderColor,
      };
    } else if (isTotalRow) {
      return {
        ...base,
        background: "#f0f7ff",
        fontWeight: "bold",
        borderColor: bodyStyle?.borderColor,
      };
    } else {
      return {
        ...base,
        background: disabled ? "#dddddd" : bodyStyle?.backgroundColor,
        color: bodyStyle?.color,
        fontWeight: bodyStyle?.fontWeight,
        fontFamily: bodyStyle?.fontFamily,
        fontStyle: bodyStyle?.fontStyle,
        borderColor: bodyStyle?.borderColor,
        cursor: !isEditable ? "not-allowed" : "text",
      };
    }
  }, [row, isTotalRow, frozen, frozenLeft, textAlign, headerStyle, bodyStyle, disabled, isEditable]);

  const handleBlur = () => {
    if (!focused && hasDropdown) {
      if (checkDropDown(`${localValue}`)) {
        onChange(row, col, `${localValue}`);
      } else {
        onChange(row, col, "");
      }
    } else if (!hasDropdown && localValue !== String(value)) {
      onChange(row, col, localValue);
    }
    onBlur(row, col);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    if (hasDropdown) onChange(row, col, newVal);
  };

  const commonInputProps = {
    ref: inputRef as any,
    value: localValue,
    onChange: handleInputChange,
    onFocus: () => onFocus(row, col),
    onBlur: handleBlur,
    readOnly: !isEditable || isTotalRow,
    className: `excel-input ${selected ? "selected" : ""} ${frozen ? "frozen" : ""}`,
  };

  const renderNormalInput = () => {
    if (isNumber) {
      return (
        <input
          type="number"
          {...commonInputProps}
          style={{
            ...cellStyle,
            boxShadow: isHighlighted ? "inset 0 0 0px 3px #dd0000e5" : "",
            width: "100%", height: "100%", border: "none",
            //  background: "transparent",
            textAlign: "right", appearance: "none", MozAppearance: "textfield",
            padding: "6px 20px 10px 12px"
          }}
        />
      );
    }
    return (
      <textarea
        {...commonInputProps}
        className={`${commonInputProps.className} ${isMultiLineInput ? '' : 'excel-input-fixed-height'} ${hasDropdown ? "dropdown-input" : ""} ${isFormula ? "formula-input" : ""}`}
        style={{
          ...cellStyle,
          boxShadow: isHighlighted ? "inset 0 0 0px 3px #dd0000e5" : "",
          width: "100%", resize: "none", height: "100%", position: "relative",
          zIndex: selected || focused ? 10 : frozen ? 20 : 0,
          textAlign: "left", border: "none",
          // background: "transparent",
        }}
      />
    );
  };

  const renderHeaderInput = () => (
    <input
      {...commonInputProps}
      readOnly={!isEditable}
      placeholder="Header"
      className={`${commonInputProps.className} header-input ${focused ? "focused" : ""}`}
      style={{
        ...cellStyle,
        boxShadow: isHighlighted ? "inset 0 0 0px 3px #dd0000e5" : "",
        position: "relative", zIndex: selected || focused ? 10 : frozen ? 20 : 0,
        textAlign: textAlign, height: "100%", border: "none", background: "transparent"
      }}
    />
  );

  return (
    <td
      className={`excel-cell ${frozen ? "frozen" : ""} ${selected && !focused ? "selected" : ""} ${focused ? "focused" : ""} ${hasDropdown ? "dropdown-cell" : ""} ${isFormula ? "formula-cell" : ""} ${!isEditable ? "readonly-cell" : ""} ${isTotalRow ? "total-cell" : ""}`}
      style={{ ...cellStyle, height: "28px", background: "#fff" }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(".dropdown-menu")) return;
        onMouseDown(row, col);
      }}
      onMouseOver={() => onMouseOver(row, col)}

      // 2. Updated onMouseUp logic
      onMouseUp={() => {
        // Toggle local state to force this specific cell to re-render
        setMouseUpTrigger(prev => !prev);
        onMouseUp(); // Call parent handler
      }}

      onContextMenu={(e) => onContextMenu(e, row, col)}

      onClick={(e) => {
        onClick(e, row, col);
        setTimeout(() => {
          if (hasDropdown) onCellDropDown(id, headerVal, false, "No");
          else onCellDropDown(id, headerVal, false, "Yes");
        }, 0);
      }}

      ref={(el) => {
        if (colRefs.current && !colRefs.current[col]) colRefs.current[col] = el!;
        if (!cellRefs.current[row]) cellRefs.current[row] = [];
        cellRefs.current[row][col] = el!;
      }}
    >
      <div className="col-resizer" onMouseDown={(e) => startResize(e, col, true)} />
      <div className="row-resizer" onMouseDown={(e) => startResize(e, row, false)}
        style={{ borderBottom: selected || focused ? "none" : "1px solid #e1e7ff" }} />

      {row === 0 ? renderHeaderInput() : (fileSetCell && !isTotalRow && hasUpload) ?
        <div style={{
          display: "flex", flexDirection: "row", gap: "8px", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", background: "white", position: "relative", top: "-2px"
        }}>
          {value === "" ? <span>No File</span> : <button onClick={() => onFileView(String(row), headerVal, value as string)}>View</button>}
        </div>
        : renderNormalInput()
      }

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

// 3. Updated Comparator
const arePropsEqual = (prev: GridCellProps, next: GridCellProps) => {
  return (
    prev.value === next.value &&
    prev.selected === next.selected &&
    prev.focused === next.focused &&
    prev.isHighlighted === next.isHighlighted &&
    prev.disabled === next.disabled &&
    prev.frozen === next.frozen &&
    prev.frozenLeft === next.frozenLeft &&
    prev.textAlign === next.textAlign &&

    prev.hasDropdown === next.hasDropdown &&
    prev.isEditable === next.isEditable &&
    prev.headerVal === next.headerVal &&
    // Check if the onMouseUp handler itself changed (allows parent to force update if function ref changes)
    prev.onMouseUp === next.onMouseUp &&
    prev.onClick === next.onClick &&
    prev.onChange === next.onChange &&
    prev.onFocus === next.onFocus &&
    prev.checkDropDown === next.checkDropDown &&
    prev.onCellDropDown === next.onCellDropDown
  );
};

export const GridCell = React.memo(GridCellComponent, arePropsEqual);