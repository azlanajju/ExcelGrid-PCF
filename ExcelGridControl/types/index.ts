export type Cell = string | number;

export interface GridConfig {
  [columnIndex: number]: string[];
}

export interface FormulaConfig {
  [columnIndex: number]: string;
}

export interface ResetConfig {
  [columnIndex: string]: string;
}

export interface UploadConfig {
  [columnIndex: number]: string;
}

export interface ConversionConfig {
  [key: number]: [number, number];
}

export interface ExcelGridProps {
  title: string;
  height: string;
  onDataChange: (data: Cell[][], frozenColumns?: string) => void;
  onColumnOrderChange: (columnOrder: string) => void;
  onFileUpdload: (row: string, col: string) => void;
  onCellDropDown: (row: string, col: string, isReset?: boolean) => void;
  onFileView: (row: string, col: string, currVal: string) => void;
  inputGrid?: Cell[][] | string;
  gridConfig?: number[];
  resetConfig : any;
  multiLineCols?: number[];
  numberCols?: number[];
  gridConfigVals?: string[];
  cellHighlight?: string[];
  cellsDisabled?: string[];
  formulaConfig?: FormulaConfig;
  uploadChange: (val: string) => void;
  uploadDelay?: number;
  frozenColumns?: number[];
  fileSetCells?: number[];
  ignoreValidationColumn?: string[];
  tableEditable: boolean;
  showUploadButton: boolean;
  showDownloadButton: boolean;
  noValidaton: boolean;
  headerEditable?: boolean;
  showAddRowButton?: boolean;
  showAddColumnButton?: boolean;
  dropDownDelay? : number;
  selectedCell?: string;
  sumTotalColumns: number[];
  readOnlyColumns?: number[];
  frozenColumnsString: string;
  conversionCols: ConversionConfig;
  columnOrder?: string;
  headerStyle?: {
    backgroundColor?: string;
    headerBackgroundColorFrozen?: string;
    borderColor?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    color?: string;
  };
  bodyStyle?: {
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
  };
}

export interface DropdownState {
  row: number;
  col: number;
  options: string[];
  filteredOptions: string[];
  inputValue: string;
}

export interface Selection {
  start: [number, number];
  end: [number, number];
}

export interface ContextMenu {
  x: number;
  y: number;
  row: number;
  col: number;
}
