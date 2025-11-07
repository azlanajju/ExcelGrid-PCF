// hooks/useFormulas.ts
import { useCallback } from 'react';
import { Cell, FormulaConfig } from '../types';
import { evaluateFormula } from '../utils/formulas';

export const useFormulas = () => {
  const updateFormulas = useCallback((newData: Cell[][], formulaConfig?: FormulaConfig): Cell[][] => {
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
  }, []);

  return {
    updateFormulas
  };
};