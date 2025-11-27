import { useState, useCallback } from 'react';
import { Cell, DropdownState } from '../types';
import { filterOptions } from '../utils/validation';

export const useDropdown = (
  data: Cell[][], 
  setData: React.Dispatch<React.SetStateAction<Cell[][]>>, 
  configData: any, 
  cellRefs: React.RefObject<HTMLTableCellElement[][]>, 
  tableRef: React.RefObject<HTMLTableElement>
) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownState | null>(null);

  const selectDropdownOption = useCallback((option: string) => {
    if (activeDropdown) {
      const { row, col } = activeDropdown;
      setData(prev => {
        const newData = prev.map(r => [...r]);
        newData[row][col] = `${option}\u200B`;
        return newData;
      });
      setActiveDropdown(null);
    }
  }, [activeDropdown, setData]);

  // const getDropdownPosition = useCallback((row: number, col: number) => {
  //   const cellElement = cellRefs.current?.[row]?.[col];
  //   const tableElement = tableRef.current;
    
  //   if (!cellElement || !tableElement) return { top: 0, left: 0, width: 200 };

  //   const cellRect = cellElement.getBoundingClientRect();
  //   const tableRect = tableElement.getBoundingClientRect();
    
  //   // Calculate position relative to the table container
  //   return {
  //     top: cellRect.bottom - tableRect.top,
  //     left: cellRect.left - tableRect.left,
  //     width: cellRect.width
  //   };
  // }, [cellRefs, tableRef]);

  const getDropdownPosition = useCallback((row: number, col: number) => {
    const cellElement = cellRefs.current?.[row]?.[col];
    const tableElement = tableRef.current;
    
    if (!cellElement || !tableElement) return { top: 0, left: 0, width: 200 };

    const cellRect = cellElement.getBoundingClientRect();
    const tableRect = tableElement.getBoundingClientRect();
    
    // Calculate position relative to the table container
    return {
      top: cellRect.bottom,
      left: cellRect.left ,
      width: cellRect.width
    };
  }, [cellRefs, tableRef]);

  const hasDropdownOptions = useCallback((col: number): boolean => {
    return configData && configData[col] && Array.isArray(configData[col]);
  }, [configData]);

  const getDropdownOptions = useCallback((col: number): string[] => {
    return configData?.[col] || [];
  }, [configData]);

  return {
    activeDropdown,
    setActiveDropdown,
    selectDropdownOption,
    getDropdownPosition,
    hasDropdownOptions,
    getDropdownOptions
  };
};