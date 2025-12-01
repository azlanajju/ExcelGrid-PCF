import React from "react";
import ExcelUploader from "./ExcelUploader";

interface ToolbarProps {
  tableEditable: boolean;
  showAddRowButton?: boolean;
  showAddColumnButton?: boolean;
  addRow: () => void;
  addCol: () => void;
  downloadExcel: () => void;
  downloadExcelAll: () => void;
  onDataLoaded: (matrix: any[][]) => void;
  getDropdownOptions: (col: number) => string[];
  showDownloadButton: boolean;
  showUploadButton: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ tableEditable, showAddRowButton = true,showUploadButton,showDownloadButton, showAddColumnButton = true, addRow, addCol, downloadExcel, downloadExcelAll, onDataLoaded, getDropdownOptions }) => {
  if (!tableEditable) return null;

  return (
    <div className="excel-toolbar">
      {showAddRowButton && (
        <button className="toolbar-icon-btn" onClick={addRow} title="Add Row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 8H21M3 16H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </button>
      )}
      {showAddColumnButton && (
        <button className="toolbar-icon-btn" onClick={addCol} title="Add Column">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 3V21M16 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </button>
      )}
      {showDownloadButton &&
      <button className="toolbar-icon-btn" onClick={downloadExcel} title="Download Metadata">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 17V9M12 17L9 14M12 17L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>}

      {showDownloadButton &&
      <button className="toolbar-icon-btn" onClick={downloadExcelAll} title="Download All">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>}
      {showUploadButton && <ExcelUploader onDataLoaded={onDataLoaded} />}
    </div>
  );
};
