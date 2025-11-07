import { Cell, FormulaConfig,UploadConfig } from '../types';

export const columnLetterToIndex = (letter: string): number => {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result - 1;
};

export const evaluateFormula = (formula: string, rowIndex: number, data: Cell[][]): number => {
  try {
    let expression = formula;
    const columnMatches = expression.match(/[A-Z]+/g);

    if (columnMatches) {
      for (const colRef of columnMatches) {
        const colIndex = columnLetterToIndex(colRef);
        if (colIndex >= 0 && colIndex < data[rowIndex].length) {
          const value = data[rowIndex][colIndex];
          const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
          expression = expression.replace(new RegExp(colRef, 'g'), numValue.toString());
        }
      }
    }

    const result = Function('"use strict"; return (' + expression + ')')();
    return isNaN(result) ? 0 : Number(result);
  } catch (error) {
    console.warn('Formula evaluation error:', error);
    return 0;
  }
};

export const hasFormula = (col: number, formulaConfig?: FormulaConfig): boolean => {
  return formulaConfig && formulaConfig[col] !== undefined;
};

export const hasUpload = (col: number, uploadConfig = [5]): boolean => {
  return col==5
  console.log("has upload" + col,uploadConfig && uploadConfig[col] !== undefined,uploadConfig);
  
  return uploadConfig && uploadConfig[col] !== undefined;
};


export const getFormula = (col: number, formulaConfig?: FormulaConfig): string => {
  return formulaConfig?.[col] || '';
};

// This is a regular function, not a hook
export const updateFormulas = (newData: Cell[][], formulaConfig?: FormulaConfig): Cell[][] => {
  if (!formulaConfig) return newData;

  const updatedData = newData.map(row => [...row]);

  for (let rowIndex = 1; rowIndex < updatedData.length; rowIndex++) {
    for (const [colIndexStr, formula] of Object.entries(formulaConfig)) {
      const colIndex = parseInt(colIndexStr);
      if (colIndex < updatedData[rowIndex].length) {
        const calculatedValue = evaluateFormula(formula, rowIndex, updatedData);
        updatedData[rowIndex][colIndex] = calculatedValue;
      }
    }
  }

  return updatedData;
};