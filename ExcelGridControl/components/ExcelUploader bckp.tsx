import React from "react";
import * as XLSX from "xlsx";

type ExcelUploaderProps = {
  onDataLoaded: (matrix: (string | number)[][]) => void;
  getDropdownOptions: (col: number) => string[];
};

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ 
  onDataLoaded, 
  getDropdownOptions 
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      // Parse Excel
      const workbook = XLSX.read(data, { 
        type: "binary", 
        cellDates: true 
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to 2D jagged array
      const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
      }) as (string | number)[][]; 

      // Find max number of columns
      const maxCols = Math.max(...jsonData.map(row => row.length));

      // Validate and pad each row
      const validatedData = jsonData.map((row, rowIndex) => {
        const newRow = [...row];
        
        // Pad with empty strings first
        while (newRow.length < maxCols) {
          newRow.push("");
        }

        // Validate each column value against dropdown options
        for (let colIndex = 0; colIndex < newRow.length; colIndex++) {
          const cellValue = newRow[colIndex];
          
          // Skip empty cells or header row (assuming first row is header)
          if (!cellValue || cellValue === "" || rowIndex === 0) {
            continue;
          }

          // Get valid options for this column
          const validOptions = getDropdownOptions(colIndex);
          
          // If there are valid options for this column, check if the value is valid
          if (validOptions && validOptions.length > 0) {
            const stringValue = String(cellValue).trim();
            
            // Case-insensitive comparison
            const isValidOption = validOptions.some(
              option => option.toLowerCase() === stringValue.toLowerCase()
            );

            // If value is not valid, replace with empty string or first valid option
            if (!isValidOption) {
              console.warn(
                `Invalid value "${cellValue}" in row ${rowIndex + 1}, column ${colIndex + 1}. ` +
                `Valid options: ${validOptions.join(", ")}`
              );
              
              // Option 1: Replace with empty string
              newRow[colIndex] = "";
              
              // Option 2: Replace with first valid option (uncomment if preferred)
              // newRow[colIndex] = validOptions[0];
            } else {
              // Ensure consistent casing by using the exact option from dropdown
              const matchingOption = validOptions.find(
                option => option.toLowerCase() === stringValue.toLowerCase()
              );
              if (matchingOption) {
                newRow[colIndex] = matchingOption;
              }
            }
          }
        }

        return newRow;
      });

      onDataLoaded(validatedData);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <label className="toolbar-btn">
      <span>📂</span> Upload Excel
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </label>
  );
};

export default ExcelUploader;