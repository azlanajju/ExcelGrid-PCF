import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ExcelGrid } from "./ExcelGrid";
import { IInputs, IOutputs } from "./generated/ManifestTypes";

const constants = {
  gridData: [["Header1", "Header2", "Header3"]],
  currentKey: 0,
  resetConfig: "{}",
  frozenColumns: "",
  title: "Excel Grid",
  sampleGrid: "",
  height: "",
  columnDefinition: "",
  numberCols: "",
  multiLineCols: "",
  cellsDisabled: "[]",
  columnDefinitionValue: "",
  ignoreValidationColumn: "",
  cellHighlight: "[]",
  formulaDefiniation: "",
  tableEditable: true,
  headerEditable: true,
  showAddRowButton: true,
  showAddColumnButton: true,
  showUploadButton: true,
  showDownloadButton: true,
  noValidaton: false,
  sumTotalColumns: "",
  conversionCols: "",
  uploadingCell: "",
  viewingCell: "",
  columnDropdownSelected: "",
  dropDownDelay: "100",
  selectedCell: "",
  fileSetCells: "", // ✅ new
  uploadingFile: "",

  header: {
    fontFamily: "inherit",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "600",
    textColor: "#020617",
    backgroundColor: "#e2e8f0",
    borderColor: "#e2e8f0",
    backgroundColorFrozen: "#b1b1b1",
  },

  body: {
    fontFamily: "inherit",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "400",
    textColor: "#020617",
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
};

export class DPSGridV25 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private root: Root;
  private notifyOutputChanged: () => void;

  private gridData: string[][] = [["Header1", "Header2", "Header3"]];
  private currentKey = 0;

  private frozenColumns = constants.frozenColumns;
  private title = constants.title;
  private height = constants.height;
  private resetConfig = constants.resetConfig;
  private fileSetCells = constants.fileSetCells;
  private sampleGrid = constants.sampleGrid;
  private columnDefinition = constants.columnDefinition;
  private multiLineCols = constants.multiLineCols;
  private cellsDisabled = constants.cellsDisabled;
  private numberCols = constants.numberCols;
  private columnDefinitionValue = constants.columnDefinitionValue;
  private ignoreValidationColumn = constants.ignoreValidationColumn;
  private cellHighlight = constants.cellHighlight;
  private formulaDefiniation = constants.formulaDefiniation;
  private tableEditable = constants.tableEditable;
  private headerEditable = constants.headerEditable;
  private showAddRowButton = constants.showAddRowButton;
  private showAddColumnButton = constants.showAddColumnButton;
  private showUploadButton = constants.showUploadButton;
  private showDownloadButton = constants.showDownloadButton;
  private noValidaton = constants.noValidaton;
  private sumTotalColumns = constants.sumTotalColumns;
  private readOnlyColumns = "";
  private conversionCols = constants.conversionCols;
  private columnOrder = "";
  private uploadingFile = "";

  private uploadingCell: string = "";
  private viewingCell: string = "";
  private dropDownDelay: string = "100";
  private uploadDelay: string = "1000";
  columnDropdownSelected: string = "";
  selectedCell: string = "";

  // Header style props
  private headerFontFamily = constants.header.fontFamily;
  private headerFontSize = constants.header.fontSize;
  private headerFontStyle = constants.header.fontStyle;
  private headerFontWeight = constants.header.fontWeight;
  private headerTextColor = constants.header.textColor;
  private headerBackgroundColor = constants.header.backgroundColor;
  private headerBorderColor = constants.header.borderColor;
  private headerBackgroundColorFrozen = constants.header.backgroundColorFrozen;

  // Body style props
  private bodyFontFamily = constants.body.fontFamily;
  private bodyFontSize = constants.body.fontSize;
  private bodyFontStyle = constants.body.fontStyle;
  private bodyFontWeight = constants.body.fontWeight;
  private bodyTextColor = constants.body.textColor;
  private bodyBackgroundColor = constants.body.backgroundColor;
  private bodyBorderColor = constants.body.borderColor;






  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
    this.container = container;
    this.notifyOutputChanged = notifyOutputChanged;
    this.root = createRoot(this.container);

    this.updateGridProps(context);
    this.renderGrid();
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const prev = {
      frozenColumns: this.frozenColumns,
      title: this.title,
      height: this.height,
      resetConfig: this.resetConfig,
      fileSetCells: this.fileSetCells, // ✅ track
      uploadingCell: this.uploadingCell,
      viewingCell: this.viewingCell,
      dropDownDelay: this.dropDownDelay,
      uploadDelay: this.uploadDelay,
      columnDropdownSelected: this.columnDropdownSelected,
      selectedCell: this.selectedCell,
      sampleGrid: this.sampleGrid,
      columnDefinitionValue: this.columnDefinitionValue,
      ignoreValidationColumn: this.ignoreValidationColumn,
      cellHighlight: this.cellHighlight,
      cellsDisabled: this.cellsDisabled,
      columnDefinition: this.columnDefinition,
      numberCols: this.numberCols,
      multiLineCols: this.multiLineCols,
      formulaDefiniation: this.formulaDefiniation,
      tableEditable: this.tableEditable,
      showUploadButton: this.showUploadButton,
      showDownloadButton: this.showDownloadButton,
      noValidaton: this.noValidaton,
      sumTotalColumns: this.sumTotalColumns,
      readOnlyColumns: this.readOnlyColumns,
      conversionCols: this.conversionCols,
      columnOrder: this.columnOrder,
      uploadingFile: this.uploadingFile,

      // Header
      headerFontFamily: this.headerFontFamily,
      headerFontSize: this.headerFontSize,
      headerFontStyle: this.headerFontStyle,
      headerFontWeight: this.headerFontWeight,
      headerTextColor: this.headerTextColor,
      headerBackgroundColor: this.headerBackgroundColor,
      headerBorderColor: this.headerBorderColor,
      headerBackgroundColorFrozen: this.headerBackgroundColorFrozen,

      // Body
      bodyFontFamily: this.bodyFontFamily,
      bodyFontSize: this.bodyFontSize,
      bodyFontStyle: this.bodyFontStyle,
      bodyFontWeight: this.bodyFontWeight,
      bodyTextColor: this.bodyTextColor,
      bodyBackgroundColor: this.bodyBackgroundColor,
      bodyBorderColor: this.bodyBorderColor,
    };

    this.updateGridProps(context);

    if (
      prev.frozenColumns !== this.frozenColumns ||
      prev.title !== this.title ||
      prev.height !== this.height ||
      prev.resetConfig !== this.resetConfig ||
      prev.fileSetCells !== this.fileSetCells || // ✅ check
      prev.uploadingCell !== this.uploadingCell ||
      prev.viewingCell !== this.viewingCell ||
      prev.dropDownDelay !== this.dropDownDelay ||
      prev.uploadDelay !== this.uploadDelay ||
      prev.columnDropdownSelected !== this.columnDropdownSelected ||
      prev.selectedCell !== this.selectedCell ||
      prev.sampleGrid !== this.sampleGrid ||
      prev.columnDefinitionValue !== this.columnDefinitionValue ||
      prev.ignoreValidationColumn !== this.ignoreValidationColumn ||
      prev.cellHighlight !== this.cellHighlight ||
      prev.cellsDisabled !== this.cellsDisabled ||
      prev.columnDefinition !== this.columnDefinition ||
      prev.multiLineCols !== this.multiLineCols ||
      prev.numberCols !== this.numberCols ||
      prev.formulaDefiniation !== this.formulaDefiniation ||
      prev.tableEditable !== this.tableEditable ||
      prev.showUploadButton !== this.showUploadButton ||
      prev.showDownloadButton !== this.showDownloadButton ||
      prev.noValidaton !== this.noValidaton ||
      prev.sumTotalColumns !== this.sumTotalColumns ||
      prev.readOnlyColumns !== this.readOnlyColumns ||
      prev.conversionCols !== this.conversionCols ||
      prev.columnOrder !== this.columnOrder ||
      prev.uploadingFile !== this.uploadingFile ||
      // Header checks
      prev.headerFontFamily !== this.headerFontFamily ||
      prev.headerFontSize !== this.headerFontSize ||
      prev.headerFontStyle !== this.headerFontStyle ||
      prev.headerFontWeight !== this.headerFontWeight ||
      prev.headerTextColor !== this.headerTextColor ||
      prev.headerBackgroundColor !== this.headerBackgroundColor ||
      prev.headerBorderColor !== this.headerBorderColor ||
      prev.headerBackgroundColorFrozen !== this.headerBackgroundColorFrozen ||
      // Body checks
      prev.bodyFontFamily !== this.bodyFontFamily ||
      prev.bodyFontSize !== this.bodyFontSize ||
      prev.bodyFontStyle !== this.bodyFontStyle ||
      prev.bodyFontWeight !== this.bodyFontWeight ||
      prev.bodyTextColor !== this.bodyTextColor ||
      prev.bodyBackgroundColor !== this.bodyBackgroundColor ||
      prev.bodyBorderColor !== this.bodyBorderColor
    ) {
      this.currentKey++;
      this.renderGrid();
    }
  }

  private getOrDefault(param: ComponentFramework.PropertyTypes.StringProperty | ComponentFramework.PropertyTypes.TwoOptionsProperty, current: string | boolean): any {
    if (typeof param?.raw === "boolean") {
      return param.raw;
    }
    return !param?.raw || param.raw.trim() === "" || param.raw === "val" ? current : param.raw;
  }

  private updateGridProps(context: ComponentFramework.Context<IInputs>) {
    // console.log("ignore val", this.getOrDefault(context.parameters.ignoreValidationColumn, constants.ignoreValidationColumn),context.parameters);
    // console.log("context.parameters.resetConfig",context.parameters.resetConfig);

    // Header styles
    this.headerFontFamily = this.getOrDefault(context.parameters.headerFontFamily, constants.header.fontFamily);
    this.headerFontSize = this.getOrDefault(context.parameters.headerFontSize, constants.header.fontSize);
    this.headerFontStyle = this.getOrDefault(context.parameters.headerFontStyle, constants.header.fontStyle);
    this.headerFontWeight = this.getOrDefault(context.parameters.headerFontWeight, constants.header.fontWeight);
    this.headerTextColor = this.getOrDefault(context.parameters.headerTextColor, constants.header.textColor);
    this.headerBackgroundColor = this.getOrDefault(context.parameters.headerBackgroundColor, constants.header.backgroundColor);
    this.headerBorderColor = this.getOrDefault(context.parameters.headerBorderColor, constants.header.borderColor);
    this.headerBackgroundColorFrozen = this.getOrDefault(context.parameters.headerBackgroundColorFrozen, constants.header.backgroundColorFrozen);

    // Body styles
    this.bodyFontFamily = this.getOrDefault(context.parameters.bodyFontFamily, constants.body.fontFamily);
    this.bodyFontSize = this.getOrDefault(context.parameters.bodyFontSize, constants.body.fontSize);
    this.bodyFontStyle = this.getOrDefault(context.parameters.bodyFontStyle, constants.body.fontStyle);
    this.bodyFontWeight = this.getOrDefault(context.parameters.bodyFontWeight, constants.body.fontWeight);
    this.bodyTextColor = this.getOrDefault(context.parameters.bodyTextColor, constants.body.textColor);
    this.bodyBackgroundColor = this.getOrDefault(context.parameters.bodyBackgroundColor, constants.body.backgroundColor);
    this.bodyBorderColor = this.getOrDefault(context.parameters.bodyBorderColor, constants.body.borderColor);

    // Inputs
    this.frozenColumns = this.getOrDefault(context.parameters.frozenColumns, constants.frozenColumns);
    this.title = this.getOrDefault(context.parameters.title, constants.title);
    this.height = this.getOrDefault(context.parameters.height, constants.height);
    this.resetConfig = this.getOrDefault(context.parameters.resetConfig, constants.resetConfig);
    this.fileSetCells = this.getOrDefault(context.parameters.fileSetCells, constants.fileSetCells); // ✅ new



    this.uploadingCell = this.getOrDefault(context.parameters.uploadingCell, constants.uploadingCell);
    this.viewingCell = this.getOrDefault(context.parameters.viewingCell, constants.viewingCell);
    this.dropDownDelay = this.getOrDefault(context.parameters.dropDownDelay, constants.dropDownDelay);
    this.uploadDelay = this.getOrDefault(context.parameters.uploadDelay, "1000");

    this.columnDropdownSelected = this.getOrDefault(context.parameters.columnDropdownSelected, constants.columnDropdownSelected);
    this.selectedCell = this.getOrDefault(context.parameters.selectedCell, constants.selectedCell);

    this.sampleGrid = this.getOrDefault(context.parameters.gridInput, constants.sampleGrid);
    this.columnDefinitionValue = this.getOrDefault(context.parameters.columnDefinitionValue, constants.columnDefinitionValue);
    this.ignoreValidationColumn = this.getOrDefault(context.parameters.ignoreValidationColumn, constants.ignoreValidationColumn);
    this.cellHighlight = this.getOrDefault(context.parameters.cellHighlight, constants.cellHighlight);
    this.cellsDisabled = this.getOrDefault(context.parameters.cellsDisabled, constants.cellsDisabled);
    this.columnDefinition = this.getOrDefault(context.parameters.columnDefinition, constants.columnDefinition);
    this.numberCols = this.getOrDefault(context.parameters.numberCols, constants.numberCols);
    this.multiLineCols = this.getOrDefault(context.parameters.multiLineCols, constants.multiLineCols);
    this.formulaDefiniation = this.getOrDefault(context.parameters.formulaDefiniation, constants.formulaDefiniation);
    this.tableEditable = this.getOrDefault(context.parameters.tableEditable, constants.tableEditable);
    this.showUploadButton = this.getOrDefault(context.parameters.showUploadButton, constants.showUploadButton);
    this.showDownloadButton = this.getOrDefault(context.parameters.showDownloadButton, constants.showDownloadButton);
    this.noValidaton = this.getOrDefault(context.parameters.noValidaton, constants.noValidaton);
    this.headerEditable = this.getOrDefault(context.parameters.headerEditable, constants.headerEditable);
    this.showAddRowButton = this.getOrDefault(context.parameters.showAddRowButton, constants.showAddRowButton);
    this.showAddColumnButton = this.getOrDefault(context.parameters.showAddColumnButton, constants.showAddColumnButton);
    this.sumTotalColumns = this.getOrDefault(context.parameters.sumTotalColumns, constants.sumTotalColumns);
    this.readOnlyColumns = this.getOrDefault(context.parameters.readOnlyColumns, "");
    this.conversionCols = "";
    this.columnOrder = this.getOrDefault(context.parameters.columnOrder, "");
    this.uploadingFile = this.getOrDefault(context.parameters.uploadingFile, "");
  }

  private renderGrid() {
    const frozenColsArray = this.frozenColumns
      .split(";")
      .filter((val) => val !== "" && !isNaN(Number(val)))
      .map((val) => Number(val));

    const fileSetCellsArray = this.fileSetCells
      .split(";")
      .filter((val) => val !== "" && !isNaN(Number(val)))
      .map((val) => Number(val));

    const readOnlyColumnsArray = this.readOnlyColumns
      .split(";")
      .filter((val) => val !== "" && !isNaN(Number(val)))
      .map((val) => Number(val));

    this.root.render(
      React.createElement(ExcelGrid, {
        inputGrid: this.sampleGrid,
        resetConfig: this.resetConfig ? JSON.parse(this.resetConfig) : {},
        gridConfig: this.columnDefinition
          ? this.columnDefinition
            .trim()
            .split(";")
            .filter((val) => val !== "")
            .map((val) => Number(val))
          : [],
        numberCols: this.numberCols
          ? this.numberCols
            .trim()
            .split(";")
            .filter((val) => val !== "")
            .map((val) => Number(val))
          : [],
        multiLineCols: this.multiLineCols
          ? this.multiLineCols
            .trim()
            .split(";")
            .filter((val) => val !== "")
            .map((val) => Number(val))
          : [],
        gridConfigVals: this.columnDefinitionValue
          ? this.columnDefinitionValue
            .trim()
            .split(";")
            .filter((val) => val !== "")
          : [],
        ignoreValidationColumn: this.ignoreValidationColumn
          ? this.ignoreValidationColumn
            .trim()
            .split(";")
            .filter((val) => val !== "")
          : [],
        cellHighlight: this.cellHighlight ? JSON.parse(this.cellHighlight) : undefined,
        cellsDisabled: this.cellsDisabled ? JSON.parse(this.cellsDisabled) : undefined,
        formulaConfig: this.formulaDefiniation ? JSON.parse(this.formulaDefiniation) : undefined,
        sumTotalColumns: this.sumTotalColumns
          .trim()
          .split(";")
          .filter((val) => val !== "")
          .map((val) => Number(val)),
        readOnlyColumns: readOnlyColumnsArray,
        conversionCols: this.conversionCols ? JSON.parse(this.conversionCols) : undefined,
        tableEditable: this.tableEditable,
        showUploadButton: this.showUploadButton,
        showDownloadButton: this.showDownloadButton,
        noValidaton: this.noValidaton,
        headerEditable: this.headerEditable,
        showAddRowButton: this.showAddRowButton,
        showAddColumnButton: this.showAddColumnButton,
        frozenColumns: frozenColsArray,
        frozenColumnsString: this.frozenColumns,
        title: this.title,
        height: this.height,
        fileSetCells: fileSetCellsArray,
        columnOrder: this.columnOrder,
        dropDownDelay: parseInt(this.dropDownDelay),
        uploadDelay: parseInt(this.uploadDelay),
        selectedCell: this.selectedCell,
        uploadChange: (val: string) => {
          this.uploadingFile = val;
          this.notifyOutputChanged();
        },

        // onDataChange: (data: string[][], frozenColumns = "", fileSetCells = "") => {
        //   this.sampleGrid = JSON.stringify(data);
        //   this.frozenColumns = frozenColumns;
        //   this.fileSetCells = fileSetCells; // ✅ keep updated
        //   this.notifyOutputChanged();
        // },
        onDataChange: (data: string[][], frozenColumns = "", fileSetCells = "") => {
          // this.debounceNotifyOutput(data, frozenColumns, fileSetCells);
          this.sampleGrid = JSON.stringify(data);
          this.frozenColumns = frozenColumns;
          this.fileSetCells = fileSetCells;
          this.notifyOutputChanged();
        },


        onColumnOrderChange: (columnOrder: string) => {
          this.columnOrder = columnOrder;
          this.notifyOutputChanged();
        },

        onFileUpdload: (row: string, col: string) => {
          this.uploadingCell = `${col};${row}:${Date.now()}`;
          this.notifyOutputChanged();
        },

        onFileView: (row: string, col: string, currVal: string) => {
          this.viewingCell = `${col};${row};${currVal}:${Date.now()}`;
          this.notifyOutputChanged();
        },

        onCellDropDown: (row: string, col: string, isReset = false, isCell = "No") => {
          if (!isReset) {
            if (isCell == "No") this.columnDropdownSelected = `${col};${row}`;
            this.selectedCell = `${col};${row}`;
          } else {
            if (isCell == "No") this.columnDropdownSelected = "";
            this.selectedCell = "";
          }
          this.notifyOutputChanged();
        },

        headerStyle: {
          backgroundColor: this.headerBackgroundColor,
          borderColor: this.headerBorderColor,
          headerBackgroundColorFrozen: this.headerBackgroundColorFrozen,
          fontFamily: this.headerFontFamily,
          fontSize: this.headerFontSize,
          fontStyle: this.headerFontStyle,
          fontWeight: this.headerFontWeight,
          color: this.headerTextColor,
        },
        bodyStyle: {
          fontFamily: this.bodyFontFamily,
          fontSize: this.bodyFontSize,
          fontStyle: this.bodyFontStyle,
          fontWeight: this.bodyFontWeight,
          color: this.bodyTextColor,
          backgroundColor: this.bodyBackgroundColor,
          borderColor: this.bodyBorderColor,
        },
      })
    );
  }

  public getOutputs(): IOutputs {
    return {
      gridInput: this.sampleGrid,
      frozenColumns: this.frozenColumns,
      uploadingCell: this.uploadingCell,
      viewingCell: this.viewingCell,
      columnDropdownSelected: this.columnDropdownSelected,
      selectedCell: this.selectedCell,
      columnOrder: this.columnOrder,
      uploadingFile: this.uploadingFile,
    };
  }

  public destroy(): void {
    this.root.unmount();
  }
}
