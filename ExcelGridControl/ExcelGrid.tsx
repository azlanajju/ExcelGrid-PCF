import isEqual from "lodash.isequal";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ContextMenu } from "./components/ContextMenu";
import { DropdownMenu } from "./components/DropdownMenu";
import { Footer } from "./components/Footer";
import { GridTable } from "./components/GridTable";
import { Toolbar } from "./components/Toolbar";
import { useCellAlignment } from "./hooks/useCellAlignment";
import { useClickOutside } from "./hooks/useClickOutside";
import { useClipboard } from "./hooks/useClipboard";
import { useDropdown } from "./hooks/useDropdown";
import { useExcelData } from "./hooks/useExcelData";
import { useFormulas } from "./hooks/useFormulas";
import { useKeyboard } from "./hooks/useKeyboard";
import { useResize } from "./hooks/useResize";
import { useSelection } from "./hooks/useSelection";
import "./styles/ExcelGrid.css";
import { ExcelGridProps } from "./types";
import { twoDArrayToJson } from "./utils/converters";
import { downloadExcel, downloadExcelAll } from "./utils/download";
import { getFormula, hasFormula, hasUpload } from "./utils/formulas";
import { isValidDropdownValue } from "./utils/validation";

export const ExcelGrid: React.FC<ExcelGridProps> = (props) => {
  const { data, setData, rowIds, dataWithTotals, configData, columnsWithTotals, setColumnsWithTotals } = useExcelData(props);

  const { selection, focusedCell, setSelection, setFocusedCell, startSelection, extendSelection, endSelection, getSelectedRange } = useSelection();

  const { columnWidths, rowHeights, startResize, colRefs, colWidths, setColWidths, tableRef } = useResize(data);

  const { getCellAlignment, setTextAlign } = useCellAlignment();

  const [localFrozenColumns, setLocalFrozenColumns] = useState<number[]>(props.frozenColumns);
  const [localFileSetCells, setLocalFileSetCells] = useState<number[]>(props.frozenColumns);

  useClickOutside("dropdown-menu", () => setActiveDropdown(null));
  useClickOutside("context-menu", () => setContextMenu(null));

  useEffect(() => {
    console.log("Version:", 1.7);
  }, []);

  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
  const inputRefs = useRef<(HTMLTableCellElement | null)[][]>([]);

  useEffect(() => {
    inputRefs.current = data.map((row) => new Array(row.length).fill(null));
    cellRefs.current = data.map((row) => new Array(row.length).fill(null));
  }, [data]);

  useEffect(() => {
    setLocalFrozenColumns(props.frozenColumns);
  }, [props.frozenColumnsString]);

  useEffect(() => {
    setLocalFileSetCells(props.fileSetCells);
  }, [props.fileSetCells]);

  const [frozenPositions, setFrozenPositions] = useState<Record<number, number>>({});

  useEffect(() => {
    const positions: Record<number, number> = {};
    const sortedFrozenCols = [...localFrozenColumns].sort((a, b) => a - b);
    let cumulativeLeft = 0;

    sortedFrozenCols.forEach((cIdx, i) => {
      if (cIdx === 0) {
        positions[cIdx] = 0;
        cumulativeLeft = (colWidths[cIdx] || 100) - 2;
      } else {
        positions[cIdx] = i === 0 ? cumulativeLeft - 2 : cumulativeLeft;
        const columnWidth = (colWidths[cIdx] || 100) - 5 * cIdx;
        cumulativeLeft += columnWidth;
      }
    });

    setFrozenPositions(positions);
  }, [localFrozenColumns, colWidths]);

  const [frozenColumnsKey, setFrozenColumnsKey] = useState(0);

  useEffect(() => {
    setFrozenColumnsKey((prev) => prev + 1);
  }, [props.frozenColumnsString]);

  const { activeDropdown, setActiveDropdown, selectDropdownOption, getDropdownPosition } = useDropdown(data, setData, configData, cellRefs, tableRef);

  const { updateFormulas } = useFormulas();

  const hasDropdownOptions = useCallback(
    (col: number): boolean => {
      return configData && configData.includes(col);
    },
    [configData]
  );

  const getDropdownOptions = useCallback(
    (col: number): string[] => {
      return props.gridConfigVals || [];
    },
    [props.gridConfigVals]
  );

  const isCellEditable = useCallback(
    (row: number, col: number): boolean => {
      if (!props.tableEditable) return false;
      // Check if column is in readOnlyColumns list
      if (props.readOnlyColumns && props.readOnlyColumns.includes(col)) return false;
      if (row === 0) {
        // Check if header editing is enabled (defaults to true for backward compatibility)
        return props.headerEditable !== false;
      }
      if (hasFormula(col, props.formulaConfig)) return false;
      if (data[row] && data[row][0] === "Total") return false;
      return true;
    },
    [props.tableEditable, props.headerEditable, props.formulaConfig, props.readOnlyColumns, data]
  );

  const { handleKeyDown } = useKeyboard({
    data,
    setData,
    selection,
    focusedCell,
    setFocusedCell,
    setSelection,
    isCellEditable,
    hasFormula: (col) => hasFormula(col, props.formulaConfig),
    hasDropdownOptions,
    getDropdownOptions,
    updateFormulas: (newData) => updateFormulas(newData, props.formulaConfig),
  });

  useClipboard();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    row: number;
    col: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (colRefs.current.length > 0) {
      const widths = colRefs.current.map((cell) => cell?.offsetWidth || 0);
      setColWidths(widths);
    }
  }, [data, setColWidths]);

  const handleCellClick = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (row === 0 || !hasDropdownOptions(col) || hasFormula(col, props.formulaConfig)) {
        setActiveDropdown(null);
        return;
      }
      e.stopPropagation();
      const options = getDropdownOptions(col);
      const currentValue = String(data[row][col] || "");
      setActiveDropdown({
        row,
        col,
        options,
        filteredOptions: options,
        inputValue: currentValue,
      });
    },
    [hasDropdownOptions, getDropdownOptions, data, props.formulaConfig]
  );

  const handleInputFocus = useCallback(
    (row: number, col: number) => {
      setFocusedCell([row, col]);
      if (row > 0 && hasDropdownOptions(col) && !hasFormula(col, props.formulaConfig)) {
        const options = getDropdownOptions(col);
        const currentValue = String(data[row][col] || "");
        setActiveDropdown({
          row,
          col,
          options,
          filteredOptions: options,
          inputValue: currentValue,
        });
      } else {
        setActiveDropdown(null);
      }
    },
    [hasDropdownOptions, getDropdownOptions, data, props.formulaConfig]
  );

  const handleChange = useCallback(
    (row: number, col: number, value: string) => {
      if (!isCellEditable(row, col)) return;
      setData((prev) => {
        const newData = prev.map((r) => [...r]);
        newData[row][col] = value;
        return updateFormulas(newData, props.formulaConfig);
      });
    },
    [isCellEditable, props.formulaConfig, setData, updateFormulas]
  );

  const validateAndCorrectValue = useCallback(
    (row: number, col: number) => {
      // Allow free text in dropdown cells - validation removed to support custom values
      // if (row === 0 || !hasDropdownOptions(col) || hasFormula(col, props.formulaConfig)) return;
      // const currentValue = String(data[row][col] || "");
      // const options = getDropdownOptions(col);
      // if (!isValidDropdownValue(currentValue, options) && currentValue !== "") {
      //   setData((prev) => {
      //     const newData = prev.map((r) => [...r]);
      //     newData[row][col] = "";
      //     return updateFormulas(newData, props.formulaConfig);
      //   });
      // }
    },
    [hasDropdownOptions, getDropdownOptions, data, props.formulaConfig, setData, updateFormulas]
  );

  const handleDownloadExcel = () => {
    downloadExcel(dataWithTotals);
  };

  const handleDownloadExcelAll = () => {
    downloadExcelAll(dataWithTotals);
  };

  const getFrozenLeft = useCallback((cIdx: number) => frozenPositions[cIdx] ?? 0, [frozenPositions]);

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, row, col });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setActiveDropdown(null);
  };

  useEffect(() => {
    if (activeDropdown == null) props.onCellDropDown("", "", true);
  }, [activeDropdown]);

  // ✅ FIX: Update dropdown options if props.gridConfigVals changes
  useEffect(() => {
    if (!activeDropdown) return;
    const newOptions = getDropdownOptions(activeDropdown.col);
    if (!isEqual(newOptions, activeDropdown.options)) {
      setActiveDropdown((prev) =>
        prev
          ? {
              ...prev,
              options: newOptions,
              filteredOptions: newOptions,
            }
          : null
      );
    }
  }, [props.gridConfigVals]);

  return (
    <div className="excel-wrapper" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="excel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* <h3 className="excel-title">Excel Grid</h3> */}
          <div className="help-icon-container">
            <button className="help-icon-btn" title="Keyboard Shortcuts">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="help-tooltip">
              <div className="help-item"><span className="help-key">Tab</span> <span>Next cell</span></div>
              <div className="help-item"><span className="help-key">Shift+Tab</span> <span>Previous cell</span></div>
              <div className="help-item"><span className="help-key">Ctrl+C</span> <span>Copy</span></div>
              <div className="help-item"><span className="help-key">Ctrl+V</span> <span>Paste</span></div>
              <div className="help-item"><span className="help-key">Esc</span> <span>Close dropdown</span></div>
            </div>
          </div>
        </div>
        <Toolbar tableEditable={props.tableEditable} showAddRowButton={props.showAddRowButton} showAddColumnButton={props.showAddColumnButton} addRow={() => setData((prev) => [...prev, new Array(prev[0].length).fill("")])} addCol={() => setData((prev) => prev.map((row) => [...row, ""]))} downloadExcel={handleDownloadExcel} downloadExcelAll={handleDownloadExcelAll} onDataLoaded={(matrix) => {
          // Keep existing header and only update data rows
          setData((prev) => {
            if (prev.length === 0) return matrix;
            const existingHeader = prev[0];
            // Ensure imported data has same number of columns as header
            const headerColCount = existingHeader.length;
            const paddedMatrix = matrix.map((row) => {
              const paddedRow = [...row];
              while (paddedRow.length < headerColCount) {
                paddedRow.push("");
              }
              return paddedRow.slice(0, headerColCount);
            });
            return [existingHeader, ...paddedMatrix];
          });
        }} getDropdownOptions={getDropdownOptions} />
      </div>

      <div className="excel-scroll-container" onScroll={handleScroll}>
        <GridTable data={dataWithTotals} selection={selection} focusedCell={focusedCell} frozenCols={localFrozenColumns} fileSetCells={localFileSetCells} configData={configData} tableEditable={props.tableEditable} headerStyle={props.headerStyle} bodyStyle={props.bodyStyle} onCellClick={handleCellClick} onCellChange={handleChange} onCellFocus={handleInputFocus} rowIds={rowIds} onContextMenu={handleContextMenu} onMouseDown={startSelection} onMouseUp={endSelection} onMouseOver={extendSelection} startResize={startResize} hasDropdownOptions={hasDropdownOptions} hasFormula={(col) => hasFormula(col, props.formulaConfig)} getFormula={(col) => getFormula(col, props.formulaConfig)} hasUpload={hasUpload} validateAndCorrectValue={validateAndCorrectValue} isCellEditable={isCellEditable} colWidths={colWidths} getFrozenLeft={getFrozenLeft} tableRef={tableRef} cellRefs={cellRefs} colRefs={colRefs} conversionConfig={props.conversionCols} onFileUpdload={props.onFileUpdload} onFileView={props.onFileView} onCellDropDown={props.onCellDropDown} getCellAlignment={getCellAlignment} {...props} />

        {activeDropdown && <DropdownMenu activeDropdown={activeDropdown} onSelectOption={selectDropdownOption} position={getDropdownPosition(activeDropdown.row, activeDropdown.col)} tableEditable={props.tableEditable} tableRef={tableRef} setActiveDropdown={setActiveDropdown} endSelection={endSelection} />}
      </div>

      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={closeContextMenu}
          showAddRowButton={props.showAddRowButton}
          showAddColumnButton={props.showAddColumnButton}
          onAddRow={(rowIndex) =>
            setData((prev) => {
              const newData = [...prev];
              newData.splice(rowIndex + 1, 0, new Array(prev[0].length).fill(""));
              return updateFormulas(newData, props.formulaConfig);
            })
          }
          onAddCol={(colIndex) =>
            setData((prev) => {
              const newData = prev.map((row) => {
                const newRow = [...row];
                newRow.splice(colIndex + 1, 0, "");
                return newRow;
              });
              return updateFormulas(newData, props.formulaConfig);
            })
          }
          onRemoveRow={(rowIndex) => {
            if (rowIndex !== 0) {
              setData((prev) => {
                const newData = prev.filter((_, i) => i !== rowIndex);
                return updateFormulas(newData, props.formulaConfig);
              });
            }
          }}
          onRemoveCol={(colIndex) =>
            setData((prev) => {
              const newData = prev.map((row) => row.filter((_, i) => i !== colIndex));
              return updateFormulas(newData, props.formulaConfig);
            })
          }
          onToggleFreezeCol={(colIndex) => {
            const currentFrozen = [...localFrozenColumns];
            let updatedFrozen;
            if (currentFrozen.includes(colIndex)) {
              updatedFrozen = currentFrozen.filter((c) => c !== colIndex);
            } else {
              updatedFrozen = [...currentFrozen, colIndex];
            }
            const sortedFrozen = updatedFrozen.sort((a, b) => a - b);
            const stringFrozenCols = sortedFrozen.map((col) => col.toString()).join(";");
            setLocalFrozenColumns(sortedFrozen);
            props.onDataChange(twoDArrayToJson(data), stringFrozenCols);
          }}
          onToggleTotalColumn={(colIndex) => setColumnsWithTotals((prev) => (prev.includes(colIndex) ? prev.filter((col) => col !== colIndex) : [...prev, colIndex]))}
          onSetTextAlign={setTextAlign}
          columnsWithTotals={columnsWithTotals}
          frozenCols={localFrozenColumns}
        />
      )}

      <Footer data={dataWithTotals} configData={configData} formulaConfig={props.formulaConfig} columnsWithTotals={columnsWithTotals} selection={selection} />
    </div>
  );
};
