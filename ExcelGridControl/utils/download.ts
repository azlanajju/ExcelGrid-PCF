import * as XLSX from "xlsx";
import { Cell } from "../types";

export const downloadExcel = (data: Cell[][], filename: string = "table_data.xlsx") => {
  if (data.length === 0) return;

  // ✅ Only take the first row (headers)
  const headersOnly = [data[0]];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(headersOnly);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
};

export const downloadExcelAll = (data: Cell[][], filename: string = "table_data_all.xlsx") => {
  if (data.length === 0) return;

  // ✅ Download all data including headers
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
};

export const downloadCSV = (data: Cell[][], filename: string = "table_data.csv") => {
  const csvContent = data
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
