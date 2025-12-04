import { useCallback, useEffect, useRef, useState } from "react";
import { Cell, ExcelGridProps } from "../types";
import { updateFormulas } from "../utils";
import { jsonTo2DArray, twoDArrayToJson } from "../utils/converters";

export const useExcelData = (uploadingFileState: string, props: ExcelGridProps) => {
  const [data, setData] = useState<Cell[][]>([
    ["Header1", "Header2", "Header3"],
    ["", "", ""],
  ]);
  const [prevData, setPrevData] = useState<Cell[][]>([]);
  const [configData, setConfigData] = useState<any>([]);
  // const [frozenCols, setFrozenCols] = useState<number[]>(props.frozenColumns || []);
  const [columnsWithTotals, setColumnsWithTotals] = useState<number[]>([]);

  const [rowIds, setRowIds] = useState<Record<number, string>>({});
  const [columnOrderMap, setColumnOrderMap] = useState<number[] | null>(null);

  const firstRun = useRef(true);


  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    // your logic here ⬇⬇
    if (uploadingFileState !== "") {
      console.log("Data changed", uploadingFileState);
      setPrevData(data);
      return;
    }

    if (!props.resetConfig || !prevData.length) {
      setPrevData(data);
      return;
    }

    const resetRules = props.resetConfig; // example: { "1": ["2"] }
    let updated = false;

    const newData = data.map((row, rowIndex) => {
      if (rowIndex === 0) return row; // skip headers

      let updatedRow = [...row];

      Object.entries(resetRules).forEach(([sourceCol, dependentCols]: any) => {
        const sc = Number(sourceCol);
        const deps = dependentCols.map(Number);

        const prevValue = prevData[rowIndex]?.[sc];
        const currentValue = row[sc];

        // Trigger only if value changed
        if (prevValue !== currentValue) {
          deps.forEach((colIdx) => {
            if (updatedRow[colIdx] !== "") {
              updatedRow[colIdx] = "";
              updated = true;
            }
          });
        }
      });

      return updatedRow;
    });

    if (updated) {
      setData(newData);
    }

    setPrevData(data);
  }, [data, props.resetConfig]);



  useEffect(() => {
    setConfigData(props.gridConfig ?? {});
  }, [props.gridConfig]);

  // useEffect(() => {console.log("Forz",props.frozenColumns,frozenCols);

  //   setFrozenCols(props.frozenColumns || []);
  // }, [props.frozenColumns]);

  useEffect(() => {
    console.log("Data set to", data);
  }, [setData, data]);

  useEffect(() => {
    // Only sync with parent if sumTotalColumns is not empty
    // This prevents the parent's empty string from overriding local totals
    if (props.sumTotalColumns && props.sumTotalColumns.length > 0) {
      setColumnsWithTotals(props.sumTotalColumns);
    }
  }, [props.sumTotalColumns]);

  const calculateDataWithTotals = useCallback(
    (data: Cell[][]) => {
      // console.log("columnsWithTotals before", columnsWithTotals);

      if (data.length <= 1 || !columnsWithTotals || columnsWithTotals.length == 0) return data;

      // console.log("columnsWithTotals", columnsWithTotals);

      const dataWithoutTotals = data.filter((row, index) => index === 0 || row[0] !== "Total");

      const totalsRow = new Array(dataWithoutTotals[0].length).fill("");

      columnsWithTotals.forEach((colIndex) => {
        if (colIndex < dataWithoutTotals[0].length) {
          let sum = 0;
          for (let i = 1; i < dataWithoutTotals.length; i++) {
            const value = dataWithoutTotals[i][colIndex];
            const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
            sum += numValue;
          }
          totalsRow[colIndex] = sum;
        }
      });

      if (totalsRow.length > 0) {
        totalsRow[0] = "Total";
      }

      return [...dataWithoutTotals, totalsRow];
    },
    [columnsWithTotals]);

  const dataWithTotals = calculateDataWithTotals(data);

  // useEffect(() => {
  //   if (props.inputGrid) {
  //     try {
  //       const parsed = typeof props.inputGrid === "string" ? jsonTo2DArray(JSON.parse(props.inputGrid)) : props.inputGrid;
  //       if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
  //         const currentJson = JSON.stringify(twoDArrayToJson(data));
  //         const newJson = JSON.stringify(twoDArrayToJson(parsed));

  //         if (currentJson !== newJson) {
  //           const dataWithFormulas = updateFormulas(parsed, props.formulaConfig);
  //           setData(dataWithFormulas);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Invalid inputGrid:", props.inputGrid, err);
  //     }
  //   }
  // }, [props.inputGrid, props.formulaConfig]);

  useEffect(() => {
    if (props.inputGrid) {
      try {
        const parsed = typeof props.inputGrid === "string" ? jsonTo2DArray(JSON.parse(props.inputGrid)) : props.inputGrid;

        if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
          // Remove totals row from parsed data for comparison
          const parsedWithoutTotals = parsed.filter((row, index) => index === 0 || row[0] !== "Total");
          const currentWithoutTotals = data.filter((row, index) => index === 0 || row[0] !== "Total");

          const currentJson = JSON.stringify(twoDArrayToJson(currentWithoutTotals));
          const newJson = JSON.stringify(twoDArrayToJson(parsedWithoutTotals));

          if (currentJson !== newJson) {
            // 🔹 Find index of "id" column (case-insensitive)
            const headers = parsedWithoutTotals[0];
            const idIndex = headers.findIndex((h) => String(h).toLowerCase() === "ID".toLocaleLowerCase());

            // 🔹 Find index of "RowUniqueID" column (case-insensitive) - should be hidden
            const rowUniqueIdIndex = headers.findIndex((h) => String(h).trim().toLowerCase() === "rowuniqueid".toLowerCase());

            let cleanedData = parsedWithoutTotals;
            let extractedIds: Record<number, string> = {};
            let columnsToRemove: number[] = [];

            // Collect columns to remove (RowUniqueID should always be removed)
            if (rowUniqueIdIndex !== -1) {
              columnsToRemove.push(rowUniqueIdIndex);
            }

            if (idIndex !== -1) {
              // If "id" column exists → use it
              for (let r = 1; r < parsedWithoutTotals.length; r++) {
                extractedIds[r] = parsedWithoutTotals[r][idIndex] as string;
              }

              // Remove id column from each row (ID column is also removed from display)
              if (!columnsToRemove.includes(idIndex)) {
                columnsToRemove.push(idIndex);
              }
            } else {
              // If no "id" column → use row index as ID
              for (let r = 1; r < parsedWithoutTotals.length; r++) {
                extractedIds[r] = r.toString();
              }
            }

            // Remove all columns that should be hidden (ID and RowUniqueID)
            if (columnsToRemove.length > 0) {
              // Sort in descending order to remove from right to left (avoid index shifting issues)
              columnsToRemove.sort((a, b) => b - a);
              cleanedData = parsedWithoutTotals.map((row) => {
                let newRow = [...row];
                columnsToRemove.forEach((colIdx) => {
                  newRow.splice(colIdx, 1);
                });
                return newRow;
              });
            }

            setRowIds(extractedIds);

            const dataWithFormulas = updateFormulas(cleanedData, props.formulaConfig);
            setData(dataWithFormulas);
          }
        }
      } catch (err) {
        console.error("Invalid inputGrid:", props.inputGrid, err);
      }
    }
  }, [props.inputGrid, props.formulaConfig]);

  // Function to reorder columns based on columnOrder
  const reorderColumns = useCallback((dataToReorder: Cell[][], newColumnOrder: string[], currentConfigData: any, currentColumnsWithTotals: number[], currentFrozenColumns: number[]) => {
    if (!dataToReorder || dataToReorder.length === 0) return { reorderedData: dataToReorder, updates: {} };

    const headerRow = dataToReorder[0];
    const currentHeaders = headerRow.map((h) => String(h));

    // Create a map from column name to current index
    const headerToIndex: Record<string, number> = {};
    currentHeaders.forEach((header, index) => {
      headerToIndex[header] = index;
    });

    // Create a mapping: newIndex -> oldIndex
    const newToOldIndexMap: number[] = [];
    const usedIndices = new Set<number>();

    newColumnOrder.forEach((header) => {
      const oldIndex = headerToIndex[header];
      if (oldIndex !== undefined && !usedIndices.has(oldIndex)) {
        newToOldIndexMap.push(oldIndex);
        usedIndices.add(oldIndex);
      }
    });

    // Add any columns that weren't in the new order (in their original order)
    currentHeaders.forEach((header, index) => {
      if (!newColumnOrder.includes(header)) {
        newToOldIndexMap.push(index);
      }
    });

    // Reorder all rows
    const reorderedData = dataToReorder.map((row) => {
      return newToOldIndexMap.map((oldIndex) => row[oldIndex]);
    });

    // Update column-based mappings
    const oldToNewIndexMap: Record<number, number> = {};
    newToOldIndexMap.forEach((oldIndex, newIndex) => {
      oldToNewIndexMap[oldIndex] = newIndex;
    });

    const updates: {
      newFrozenColumns?: number[];
      newConfigData?: any;
      newColumnsWithTotals?: number[];
    } = {};

    // Update frozen columns
    if (currentFrozenColumns && currentFrozenColumns.length > 0) {
      updates.newFrozenColumns = currentFrozenColumns
        .map((oldIndex) => oldToNewIndexMap[oldIndex])
        .filter((idx) => idx !== undefined)
        .sort((a, b) => a - b);
    }

    // Update configData (dropdown columns)
    if (currentConfigData && Array.isArray(currentConfigData) && currentConfigData.length > 0) {
      updates.newConfigData = currentConfigData.map((oldIndex: number) => oldToNewIndexMap[oldIndex]).filter((idx: number) => idx !== undefined);
    }

    // Update columnsWithTotals
    if (currentColumnsWithTotals && currentColumnsWithTotals.length > 0) {
      updates.newColumnsWithTotals = currentColumnsWithTotals.map((oldIndex) => oldToNewIndexMap[oldIndex]).filter((idx) => idx !== undefined);
    }

    setColumnOrderMap(newToOldIndexMap);

    return { reorderedData, updates };
  }, []);

  // Initialize columnOrder on first load if empty
  useEffect(() => {
    if (data.length === 0 || data[0].length === 0) return;
    if (props.columnOrder && props.columnOrder.trim() !== "") return; // Already initialized

    const currentHeaders = data[0].map((h) => String(h));
    const currentOrderJson = JSON.stringify(currentHeaders);

    if (props.onColumnOrderChange && currentOrderJson) {
      props.onColumnOrderChange(currentOrderJson);
    }
  }, [data, props.columnOrder, props.onColumnOrderChange]);

  // Handle columnOrder prop changes - reorder when columnOrder changes
  useEffect(() => {
    if (data.length === 0 || data[0].length === 0) return;
    if (!props.columnOrder || props.columnOrder.trim() === "") return;

    const currentHeaders = data[0].map((h) => String(h));
    let newColumnOrder: string[] = [];

    try {
      newColumnOrder = JSON.parse(props.columnOrder);
      if (!Array.isArray(newColumnOrder) || newColumnOrder.length === 0) return;

      // Check if all headers in newOrder exist in current headers
      const allHeadersExist = newColumnOrder.every((h) => currentHeaders.includes(h));
      if (!allHeadersExist) return;

      // Check if the order is different from current
      const currentOrderJson = JSON.stringify(currentHeaders);
      const newOrderJson = JSON.stringify(newColumnOrder);

      if (currentOrderJson === newOrderJson) return; // No reordering needed

      // Reorder the columns
      setData((prevData) => {
        const { reorderedData, updates } = reorderColumns(prevData, newColumnOrder, configData, columnsWithTotals, props.frozenColumns || []);

        // Apply updates
        if (updates.newConfigData) {
          setConfigData(updates.newConfigData);
        }
        if (updates.newColumnsWithTotals) {
          setColumnsWithTotals(updates.newColumnsWithTotals);
        }

        return reorderedData;
      });
    } catch (err) {
      console.error("Invalid columnOrder JSON:", err);
    }
  }, [props.columnOrder, reorderColumns, configData, columnsWithTotals, props.frozenColumns, data]);

  useEffect(() => {
    let stringFrozenCols = "";
    props.frozenColumns.forEach((element) => {
      stringFrozenCols += `${element};`;
    });

    // Only send data without totals to prevent circular updates
    const dataWithoutTotals = data.filter((row, index) => index === 0 || row[0] !== "Total");
    props.onDataChange(twoDArrayToJson(dataWithoutTotals), props.frozenColumns.join(";"));
  }, [data]);

  // Function to get row index by unique ID
  const getRowIndexById = useCallback(
    (id: string): number | null => {
      for (const [rowIndex, rowId] of Object.entries(rowIds)) {
        if (String(rowId) === String(id)) {
          return Number(rowIndex);
        }
      }
      return null;
    },
    [rowIds]
  );

  // Function to get row data by unique ID
  const getRowById = useCallback(
    (id: string): Cell[] | null => {
      const rowIndex = getRowIndexById(id);
      if (rowIndex !== null && rowIndex < data.length) {
        return data[rowIndex];
      }
      return null;
    },
    [data, getRowIndexById]
  );

  // Function to get row ID by row index
  const getRowIdByIndex = useCallback(
    (rowIndex: number): string | null => {
      return rowIds[rowIndex] || null;
    },
    [rowIds]
  );

  return {
    data,
    setData,
    rowIds,
    dataWithTotals,
    configData,
    columnsWithTotals,
    setColumnsWithTotals,
    getRowIndexById,
    getRowById,
    getRowIdByIndex,
  };
};
