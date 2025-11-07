import React from "react";
import * as XLSX from "xlsx";

type ExcelUploaderProps = {
  onDataLoaded: (matrix: (string | number)[][]) => void;
};

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataLoaded }) => {
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
        cellDates: true,
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to 2D jagged array
      const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
      }) as (string | number)[][];

      if (jsonData.length === 0) {
        onDataLoaded([]);
        return;
      }

      // Find max number of columns
      const maxCols = Math.max(...jsonData.map((row) => row.length));

      // Identify columns to remove (case-insensitive)
      const headers = jsonData[0];
      const idIndex = headers.findIndex(
        (h) => String(h).trim().toLowerCase() === "id"
      );
      const rowUniqueIdIndex = headers.findIndex(
        (h) => String(h).trim().toLowerCase() === "rowuniqueid"
      );

      // Collect columns to remove
      const columnsToRemove: number[] = [];
      if (idIndex !== -1) {
        columnsToRemove.push(idIndex);
      }
      if (rowUniqueIdIndex !== -1) {
        columnsToRemove.push(rowUniqueIdIndex);
      }

      // Skip the first row (header) and only process data rows
      const dataRows = jsonData.slice(1);

      if (dataRows.length === 0) {
        onDataLoaded([]);
        return;
      }

      // Clean data: pad + remove ID and RowUniqueID columns
      const cleanedData = dataRows.map((row) => {
        const newRow = [...row];

        // Pad with empty strings to ensure equal columns
        while (newRow.length < maxCols) {
          newRow.push("");
        }

        // Remove columns that should be hidden (ID and RowUniqueID)
        if (columnsToRemove.length > 0) {
          // Sort in descending order to remove from right to left (avoid index shifting issues)
          const sortedColumnsToRemove = [...columnsToRemove].sort((a, b) => b - a);
          let filteredRow = [...newRow];
          sortedColumnsToRemove.forEach((colIdx) => {
            filteredRow.splice(colIdx, 1);
          });
          return filteredRow;
        }
        return newRow;
      });

      onDataLoaded(cleanedData);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <label className="toolbar-icon-btn" title="Upload Excel">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
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
