// import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
// import { ContextMenu } from "./components/ContextMenu";
// import { DropdownMenu } from "./components/DropdownMenu";
// import { Footer } from "./components/Footer";
// import { GridTable } from "./components/GridTable";
// import { Toolbar } from "./components/Toolbar";
// import { useCellAlignment } from "./hooks/useCellAlignment";
// import { useClickOutside } from "./hooks/useClickOutside";
// import { useClipboard } from "./hooks/useClipboard";
// import { useDropdown } from "./hooks/useDropdown";
// import { useExcelData } from "./hooks/useExcelData";
// import { useFormulas } from "./hooks/useFormulas";
// import { useKeyboard } from "./hooks/useKeyboard";
// import { useResize } from "./hooks/useResize";
// import { useSelection } from "./hooks/useSelection";
// import "./styles/ExcelGrid.css";
// import { ExcelGridProps } from "./types";
// import { twoDArrayToJson } from "./utils/converters";
// import { downloadExcel, downloadExcelAll } from "./utils/download";
// import { getFormula, hasFormula, hasUpload } from "./utils/formulas";
// import { isValidDropdownValue } from "./utils/validation";

// export const ExcelGrid: React.FC<ExcelGridProps> = (props) => {
//   const { data, setData, rowIds, dataWithTotals, configData, columnsWithTotals, setColumnsWithTotals } = useExcelData(props);

//   const { selection, focusedCell, setSelection, setFocusedCell, startSelection, extendSelection, endSelection, getSelectedRange } = useSelection();

//   const { columnWidths, rowHeights, startResize, colRefs, colWidths, setColWidths, tableRef } = useResize(data);

//   const { getCellAlignment, setTextAlign } = useCellAlignment();

//   // Add state for local frozen columns management
//   const [localFrozenColumns, setLocalFrozenColumns] = useState<number[]>(props.frozenColumns);
//   const [localFileSetCells, setLocalFileSetCells] = useState<number[]>(props.frozenColumns);

//   useClickOutside("dropdown-menu", () => setActiveDropdown(null));
//   useClickOutside("context-menu", () => setContextMenu(null));

//   useEffect(() => {
//     console.log("Version:", 1.7);
//   }, []);

//   const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
//   const inputRefs = useRef<(HTMLTableCellElement | null)[][]>([]);

//   useEffect(() => {
//     inputRefs.current = data.map((row) => new Array(row.length).fill(null));
//     cellRefs.current = data.map((row) => new Array(row.length).fill(null));
//   }, [data]);

//   // Update local frozen columns when props change
//   useEffect(() => {
//     setLocalFrozenColumns(props.frozenColumns);
//   }, [props.frozenColumnsString]);

//   useEffect(() => {
//     setLocalFileSetCells(props.fileSetCells);
//   }, [props.fileSetCells]);

//   //  useEffect(() => {
//   //   props.onFileUpdload("2","column")
//   //   props.onFileView("4","column1")
//   //  },[])

//   const [frozenPositions, setFrozenPositions] = useState<Record<number, number>>({});

//   useEffect(() => {
//     const positions: Record<number, number> = {};

//     // Sort frozen columns to ensure correct positioning
//     const sortedFrozenCols = [...localFrozenColumns].sort((a, b) => a - b);

//     let cumulativeLeft = 0;

//     sortedFrozenCols.forEach((cIdx, i) => {
//       if (cIdx === 0) {
//         // First column (index 0) should always stay at position 0 when frozen
//         positions[cIdx] = 0;
//         cumulativeLeft = (colWidths[cIdx] || 100) - 2;
//       } else {
//         // Other frozen columns stack to the right of previous frozen columns
//         positions[cIdx] = i == 0 ? cumulativeLeft - 2 : cumulativeLeft;
//         const columnWidth = (colWidths[cIdx] || 100) - 5 * cIdx;
//         cumulativeLeft += columnWidth;
//       }
//     });

//     setFrozenPositions(positions);
//     console.log("Frozen positions calculated:", positions);
//     console.log("Column widths:", colWidths);
//     console.log("Sorted frozen columns:", sortedFrozenCols);
//   }, [localFrozenColumns, colWidths]);

//   const [frozenColumnsKey, setFrozenColumnsKey] = useState(0);

//   useEffect(() => {
//     // Force component update when frozen columns change
//     setFrozenColumnsKey((prev) => prev + 1);
//     console.log("🔄 Frozen columns changed, forcing update");
//   }, [props.frozenColumnsString]);

//   const { activeDropdown, setActiveDropdown, selectDropdownOption, getDropdownPosition } = useDropdown(data, setData, configData, cellRefs, tableRef);

//   const { updateFormulas } = useFormulas();

//   // Define these functions BEFORE using them in useKeyboard
//   const hasDropdownOptions = useCallback(
//     (col: number): boolean => {
//       return configData && configData.includes(col);
//     },
//     [configData]
//   );

//   const getDropdownOptions = useCallback(
//     (col: number): string[] => {
//       // return configData?.[col] || [];
//       // console.log("vals",["A","b"],col);

//       return props.gridConfigVals;
//     },
//     [configData]
//   );

//   const isCellEditable = useCallback(
//     (row: number, col: number): boolean => {
//       if (!props.tableEditable) return false;
//       if (row === 0) return true;
//       if (hasFormula(col, props.formulaConfig)) return false;
//       if (data[row] && data[row][0] === "Total") return false;
//       return true;
//     },
//     [props.tableEditable, props.formulaConfig, data]
//   );

//   // Now useKeyboard can be called after the functions are defined
//   const { handleKeyDown } = useKeyboard({
//     data,
//     setData,
//     selection,
//     focusedCell,
//     setFocusedCell,
//     setSelection,
//     isCellEditable,
//     hasFormula: (col) => hasFormula(col, props.formulaConfig),
//     hasDropdownOptions,
//     getDropdownOptions,
//     updateFormulas: (newData) => updateFormulas(newData, props.formulaConfig),
//   });

//   // clipboard functions are used internally by useKeyboard, so we don't need to expose them here
//   useClipboard(); // This is used internally by useKeyboard

//   const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);

//   useLayoutEffect(() => {
//     if (colRefs.current.length > 0) {
//       const widths = colRefs.current.map((cell) => cell?.offsetWidth || 0);
//       setColWidths(widths);
//     }
//   }, [data, setColWidths]);

//   const handleCellClick = useCallback(
//     (row: number, col: number, e: React.MouseEvent) => {
//       if (row === 0 || !hasDropdownOptions(col) || hasFormula(col, props.formulaConfig)) {
//         setActiveDropdown(null);
//         return;
//       }
//       e.stopPropagation();
//       const options = getDropdownOptions(col);
//       const currentValue = String(data[row][col] || "");
//       setActiveDropdown({
//         row,
//         col,
//         options,
//         filteredOptions: options,
//         inputValue: currentValue,
//       });
//     },
//     [hasDropdownOptions, getDropdownOptions, data, props.formulaConfig, setActiveDropdown]
//   );

//   const handleInputFocus = useCallback(
//     (row: number, col: number) => {
//       setFocusedCell([row, col]);
//       if (row > 0 && hasDropdownOptions(col) && !hasFormula(col, props.formulaConfig)) {
//         const options = getDropdownOptions(col);
//         const currentValue = String(data[row][col] || "");
//         setActiveDropdown({
//           row,
//           col,
//           options,
//           filteredOptions: options,
//           inputValue: currentValue,
//         });
//       } else {
//         setActiveDropdown(null);
//       }
//     },
//     [hasDropdownOptions, getDropdownOptions, data, props.formulaConfig, setFocusedCell, setActiveDropdown]
//   );

//   const handleChange = useCallback(
//     (row: number, col: number, value: string) => {
//       if (!isCellEditable(row, col)) return;
//       setData((prev) => {
//         const newData = prev.map((r) => [...r]);
//         newData[row][col] = value;
//         return updateFormulas(newData, props.formulaConfig);
//       });
//     },
//     [isCellEditable, props.formulaConfig, setData, updateFormulas]
//   );

//   const validateAndCorrectValue = useCallback(
//     (row: number, col: number) => {
//       if (row === 0 || !hasDropdownOptions(col) || hasFormula(col, props.formulaConfig)) return;

//       const currentValue = String(data[row][col] || "");
//       const options = getDropdownOptions(col);

//       if (!isValidDropdownValue(currentValue, options) && currentValue !== "") {
//         setData((prev) => {
//           const newData = prev.map((r) => [...r]);
//           newData[row][col] = "";
//           return updateFormulas(newData, props.formulaConfig);
//         });
//       }
//     },
//     [hasDropdownOptions, getDropdownOptions, data, props.formulaConfig, setData, updateFormulas]
//   );

//   const handleDownloadExcel = () => {
//     downloadExcel(dataWithTotals);
//   };

//   const handleDownloadExcelAll = () => {
//     downloadExcelAll(dataWithTotals);
//   };

//   const getFrozenLeft = useCallback(
//     (cIdx: number) => {
//       return frozenPositions[cIdx] ?? 0;
//     },
//     [frozenPositions]
//   );

//   const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
//     e.preventDefault();
//     setContextMenu({ x: e.clientX, y: e.clientY, row, col });
//   };

//   const closeContextMenu = () => {
//     setContextMenu(null);
//   };

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const target = e.currentTarget;
//     setActiveDropdown(null);
//   };

//   useEffect(() => {
//     if (activeDropdown == null) props.onCellDropDown("", "", true);
//   }, [activeDropdown]);

//   return (
//     <div className="excel-wrapper" onKeyDown={handleKeyDown} tabIndex={0}>
//       <div className="excel-header">
//           {/* <h3 className="excel-title">Excel Grid</h3> */}
//         <Toolbar tableEditable={props.tableEditable} addRow={() => setData((prev) => [...prev, new Array(prev[0].length).fill("")])} addCol={() => setData((prev) => prev.map((row) => [...row, ""]))} downloadExcel={handleDownloadExcel} downloadExcelAll={handleDownloadExcelAll} onDataLoaded={(matrix) => setData(matrix)} getDropdownOptions={getDropdownOptions} />
//       </div>

//       <div className="excel-scroll-container" onScroll={handleScroll}>
//         <GridTable data={dataWithTotals} selection={selection} focusedCell={focusedCell} frozenCols={localFrozenColumns} fileSetCells={localFileSetCells} configData={configData} tableEditable={props.tableEditable} headerStyle={props.headerStyle} bodyStyle={props.bodyStyle} onCellClick={handleCellClick} onCellChange={handleChange} onCellFocus={handleInputFocus} rowIds={rowIds} onContextMenu={handleContextMenu} onMouseDown={startSelection} onMouseUp={endSelection} onMouseOver={extendSelection} startResize={startResize} hasDropdownOptions={hasDropdownOptions} hasFormula={(col) => hasFormula(col, props.formulaConfig)} getFormula={(col) => getFormula(col, props.formulaConfig)} hasUpload={hasUpload} validateAndCorrectValue={validateAndCorrectValue} isCellEditable={isCellEditable} colWidths={colWidths} getFrozenLeft={getFrozenLeft} tableRef={tableRef} cellRefs={cellRefs} colRefs={colRefs} conversionConfig={props.conversionCols} onFileUpdload={props.onFileUpdload} onFileView={props.onFileView} onCellDropDown={props.onCellDropDown} getCellAlignment={getCellAlignment} {...props} />

//         {activeDropdown && <DropdownMenu activeDropdown={activeDropdown} onSelectOption={selectDropdownOption} position={getDropdownPosition(activeDropdown.row, activeDropdown.col)} tableEditable={props.tableEditable} tableRef={tableRef} setActiveDropdown={setActiveDropdown} endSelection={endSelection} />}
//       </div>

//       {contextMenu && (
//         <ContextMenu
//           contextMenu={contextMenu}
//           onClose={closeContextMenu}
//           onAddRow={(rowIndex) =>
//             setData((prev) => {
//               const newData = [...prev];
//               newData.splice(rowIndex + 1, 0, new Array(prev[0].length).fill(""));
//               return updateFormulas(newData, props.formulaConfig);
//             })
//           }
//           onAddCol={(colIndex) =>
//             setData((prev) => {
//               const newData = prev.map((row) => {
//                 const newRow = [...row];
//                 newRow.splice(colIndex + 1, 0, "");
//                 return newRow;
//               });
//               return updateFormulas(newData, props.formulaConfig);
//             })
//           }
//           onRemoveRow={(rowIndex) => {
//             if (rowIndex !== 0) {
//               setData((prev) => {
//                 const newData = prev.filter((_, i) => i !== rowIndex);
//                 return updateFormulas(newData, props.formulaConfig);
//               });
//             }
//           }}
//           onRemoveCol={(colIndex) =>
//             setData((prev) => {
//               const newData = prev.map((row) => row.filter((_, i) => i !== colIndex));
//               return updateFormulas(newData, props.formulaConfig);
//             })
//           }
//           onToggleFreezeCol={(colIndex) => {
//             const currentFrozen = [...localFrozenColumns]; // Use local state instead of props

//             let updatedFrozen;
//             if (currentFrozen.includes(colIndex)) {
//               // Remove the column from frozen list
//               updatedFrozen = currentFrozen.filter((c) => c !== colIndex);
//             } else {
//               // Add the column to frozen list
//               updatedFrozen = [...currentFrozen, colIndex];
//             }

//             // Sort the frozen columns to maintain left-to-right order
//             const sortedFrozen = updatedFrozen.sort((a, b) => a - b);

//             // Convert to string format properly
//             const stringFrozenCols = sortedFrozen.map((col) => col.toString()).join(";");

//             console.log("Current frozen:", currentFrozen);
//             console.log("Updated frozen:", sortedFrozen);
//             console.log("String format:", stringFrozenCols);

//             // Update local state immediately for instant UI response
//             setLocalFrozenColumns(sortedFrozen);

//             // Update the data change callback for persistence
//             props.onDataChange(twoDArrayToJson(data), stringFrozenCols);
//           }}
//           onToggleTotalColumn={(colIndex) => setColumnsWithTotals((prev) => (prev.includes(colIndex) ? prev.filter((col) => col !== colIndex) : [...prev, colIndex]))}
//           onSetTextAlign={setTextAlign}
//           columnsWithTotals={columnsWithTotals}
//           frozenCols={localFrozenColumns} // Use local state instead of props.frozenColumns
//         />
//       )}

//       <Footer data={dataWithTotals} configData={configData} formulaConfig={props.formulaConfig} columnsWithTotals={columnsWithTotals} selection={selection} />
//     </div>
//   );
// };
