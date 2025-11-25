import React, { useEffect, useState } from "react";
import { DropdownState } from "../types";

interface DropdownMenuProps {
  activeDropdown: DropdownState;
  onSelectOption: (option: string) => void;
  setActiveDropdown: React.Dispatch<React.SetStateAction<DropdownState>>;
  position: { top: number; left: number; width: number };
  tableEditable: boolean;
  tableRef: React.RefObject<HTMLTableElement>;
  endSelection: () => void;
  dropDownDelay: number;

  // NEW — passed from parent
  mousePos: { x: number; y: number };
  onCellDropDown: (row: string, col: string, isReset?: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  activeDropdown,
  onSelectOption,
  setActiveDropdown,
  position,
  tableEditable,
  tableRef,
  endSelection,
  dropDownDelay,
  mousePos,
  onCellDropDown
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const [visible, setVisible] = useState(false);

  // Mouse hover tracking
  const [mouseInside, setMouseInside] = useState(false);

  // Extra detection margin top/bottom
  const EXTRA_MARGIN = 12000;

  /** ---------------------------
   * POSITION CALCULATION
   * --------------------------- */
  useEffect(() => {
    if (!tableRef.current || !activeDropdown) return;

    const dropdownHeight =
      activeDropdown.filteredOptions.length === 0
        ? 38
        : activeDropdown.filteredOptions.length * 30 + 10;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let adjustedTop = position.top;
    let adjustedLeft = position.left;
    let maxHeight = dropdownHeight;

    // Prevent bottom overflow
    if (position.top + dropdownHeight > viewportHeight) {
      const spaceAbove = position.top;
      const spaceBelow = viewportHeight - position.top;

      if (spaceAbove > spaceBelow) {
        adjustedTop = Math.max(0, position.top - dropdownHeight - 5);
        maxHeight = Math.min(dropdownHeight, spaceAbove - 10);
      } else {
        maxHeight = Math.min(dropdownHeight, spaceBelow - 10);
      }
    }

    // Prevent right overflow
    if (position.left + position.width > viewportWidth) {
      adjustedLeft = Math.max(0, viewportWidth - position.width - 10);
    }

    setAdjustedPosition({
      top: adjustedTop,
      left: adjustedLeft,
      width: position.width,
      maxHeight,
    });

    const timer = setTimeout(() => setVisible(true), dropDownDelay);
    return () => clearTimeout(timer);
  }, [position, activeDropdown, tableRef]);


  /** ---------------------------
   * MOUSE TRACKING (uses parent mousePos)
   * --------------------------- */
  useEffect(() => {
    if (!activeDropdown || !adjustedPosition) return;

    const { x, y } = mousePos;

    const rect = {
      left: adjustedPosition.left,
      right: adjustedPosition.left + adjustedPosition.width,
      top: adjustedPosition.top - EXTRA_MARGIN,
      bottom: adjustedPosition.top + adjustedPosition.maxHeight + EXTRA_MARGIN
    };

    const inside =
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom;

    setMouseInside(inside);

    if (!inside) {
      setActiveDropdown(null);
      onCellDropDown("","",true);
    }
  }, [mousePos, activeDropdown, adjustedPosition]);


  /** ---------------------------
   * CLOSE ON SCROLL / RESIZE
   * --------------------------- */
  useEffect(() => {
    if (!activeDropdown) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement | Document;
      if (target instanceof HTMLElement && target.closest(".dropdown-menu"))
        return;
      setActiveDropdown(null);
    };

    const handleResize = () => setActiveDropdown(null);

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeDropdown, setActiveDropdown]);


  /** ---------------------------
   * DON'T RENDER UNTIL CONDITIONS MET
   * --------------------------- */
  if (
    !activeDropdown ||
    !tableEditable ||
    !adjustedPosition ||
    !visible ||
    !mouseInside
  ) {
    return null;
  }


  /** ---------------------------
   * RENDER DROPDOWN MENU
   * --------------------------- */
  return (
    <div
      className="dropdown-menu"
      style={{
        position: "fixed",
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        width: `${adjustedPosition.width}px`,
        maxHeight:
          activeDropdown.filteredOptions.length === 1
            ? "40vh"
            : `${adjustedPosition.maxHeight}px`,
        overflowY: "auto",
        zIndex: 1001
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {activeDropdown.filteredOptions.length > 0 ? (
        activeDropdown.filteredOptions.map((option, idx) => (
          <div
            key={idx}
            className="dropdown-option"
            onClick={() => onSelectOption(option)}
          >
            {option}
          </div>
        ))
      ) : (
        <div className="dropdown-loader">
          <div className="spinner" />
          <span>Loading options...</span>
        </div>
      )}
    </div>
  );
};
