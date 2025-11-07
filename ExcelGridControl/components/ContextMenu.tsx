import React, { useEffect, useRef } from "react";
import { ContextMenu as ContextMenuType } from "../types";

interface ContextMenuProps {
  contextMenu: ContextMenuType | null;
  onClose: () => void;
  onAddRow: (rowIndex: number) => void;
  onAddCol: (colIndex: number) => void;
  onRemoveRow: (rowIndex: number) => void;
  onRemoveCol: (colIndex: number) => void;
  onToggleFreezeCol: (colIndex: number) => void;
  onToggleTotalColumn: (colIndex: number) => void;
  onSetTextAlign: (row: number, col: number, align: "left" | "center" | "right" | "justify") => void;
  columnsWithTotals: number[];
  frozenCols: number[];
  showAddRowButton?: boolean;
  showAddColumnButton?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ contextMenu, onClose, onAddRow, onAddCol, onRemoveRow, onRemoveCol, onToggleFreezeCol, onToggleTotalColumn, onSetTextAlign, columnsWithTotals, frozenCols, showAddRowButton, showAddColumnButton }) => {
  const menuRef = useRef<HTMLUListElement>(null);

  // Position the menu with flip-up logic
  useEffect(() => {
    if (!contextMenu || !menuRef.current) return;

    const menu = menuRef.current;
    const { x, y } = contextMenu;
    const { innerWidth, innerHeight } = window;

    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    let left = x;
    let top = y;

    // shift left if overflowing right
    if (x + menuWidth > innerWidth) {
      left = innerWidth - menuWidth - 8;
    }

    // flip up if overflowing bottom
    if (y + menuHeight > innerHeight) {
      top = y - menuHeight;
      if (top < 0) top = 8; // clamp
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }, [contextMenu]);

  // Close on scroll or window resize
  useEffect(() => {
    if (!contextMenu) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;

      if (target instanceof HTMLElement) {
        if (target.closest(".context-menu")) {
          return;
        }
      }
      onClose();
    };

    const handleResize = () => onClose();

    window.addEventListener("scroll", handleScroll, true); // capture phase → catches nested scrolls
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [contextMenu, onClose]);

  if (!contextMenu) return null;

  // Handle boolean values: undefined or true = show, false = hide
  // Explicitly check for false to ensure it's hidden when disabled
  const shouldShowAddRow = showAddRowButton === undefined ? true : showAddRowButton === true;
  const shouldShowAddColumn = showAddColumnButton === undefined ? true : showAddColumnButton === true;

  return (
    <ul ref={menuRef} className="context-menu" style={{ position: "fixed" }} onClick={(e) => e.stopPropagation()}>
      <li className="context-close" onClick={onClose}>
        ✕
      </li>
      {shouldShowAddRow && (
        <li onClick={() => onAddRow(contextMenu.row)}>
          <span className="context-icon">➕</span> Insert Row Below
        </li>
      )}
      {shouldShowAddColumn && (
        <li onClick={() => onAddCol(contextMenu.col)}>
          <span className="context-icon">➕</span> Insert Column Right
        </li>
      )}
      {shouldShowAddRow && (
        <li onClick={() => onRemoveRow(contextMenu.row)} className={contextMenu.row === 0 ? "disabled" : ""}>
          <span className="context-icon">🗑️</span> Delete Row
        </li>
      )}
      {shouldShowAddColumn && (
        <li onClick={() => onRemoveCol(contextMenu.col)}>
          <span className="context-icon">🗑️</span> Delete Column
        </li>
      )}
      <li onClick={() => onToggleFreezeCol(contextMenu.col)}>
        <span className="context-icon">❄️</span>
        {frozenCols.includes(contextMenu.col) ? "Unfreeze" : "Freeze"} Column
      </li>
      <li onClick={() => onToggleTotalColumn(contextMenu.col)}>
        <span className="context-icon">∑</span>
        {columnsWithTotals.includes(contextMenu.col) ? "Remove Total" : "Add Total"}
      </li>

      {/* Text Alignment Options */}
      <li className="context-separator">Text Alignment</li>
      <li onClick={() => onSetTextAlign(contextMenu.row, contextMenu.col, "left")}>
        <span className="context-icon">⬅️</span> Align Left
      </li>
      <li onClick={() => onSetTextAlign(contextMenu.row, contextMenu.col, "center")}>
        <span className="context-icon">↔️</span> Align Center
      </li>
      <li onClick={() => onSetTextAlign(contextMenu.row, contextMenu.col, "right")}>
        <span className="context-icon">➡️</span> Align Right
      </li>
      <li onClick={() => onSetTextAlign(contextMenu.row, contextMenu.col, "justify")}>
        <span className="context-icon">↔️</span> Justify
      </li>
    </ul>
  );
};
