import React from 'react';
import { Cell, FormulaConfig } from '../types';

interface FooterProps {
  data: Cell[][];
  configData: any;
  formulaConfig?: FormulaConfig;
  columnsWithTotals: number[];
  selection: any;
}

export const Footer: React.FC<FooterProps> = ({
  data,
  configData,
  formulaConfig,
  columnsWithTotals,
  selection
}) => {
  return (
    <div className="excel-footer">
      <div className="excel-info">
        <span className="info-item">Rows: {data.length}</span>
        <span className="info-item">Columns: {data[0]?.length || 0}</span>
        <span className="info-item">Dropdowns: {Object.keys(configData || {}).length}</span>
        <span className="info-item">Formulas: {Object.keys(formulaConfig || {}).length}</span>
        <span className="info-item">Totals: {columnsWithTotals.length}</span>
        <span className="info-item">Selected: {selection ? `${Math.abs(selection.end[0] - selection.start[0]) + 1}×${Math.abs(selection.end[1] - selection.start[1]) + 1}` : "None"}</span>
      </div>
    </div>
  );
};