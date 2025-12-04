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
  gridConfigVals: string[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  activeDropdown,
  onSelectOption,
  setActiveDropdown,
  position,
  tableEditable,
  tableRef,
  dropDownDelay,
  gridConfigVals
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  // Controls fade-in, but dropdown mounts instantly (no flicker)
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const prevActiveDropdown = React.useRef<{ row: number; col: number } | null>(null);


  useEffect(() => {
    if (!tableRef.current || !activeDropdown || position.top == 0 || position.left == 0) return;

    // console.log("position",position);

    const dropdownHeight =
      activeDropdown.filteredOptions.length === 0
        ? 38
        : activeDropdown.filteredOptions.length * 30 + 10;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let adjustedTop = position.top;
    let adjustedLeft = position.left;
    let maxHeight = dropdownHeight;

    // Handle bottom overflow
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

    // Only reset visibility/loading if the cell position changed
    if (
      !prevActiveDropdown.current ||
      prevActiveDropdown.current.row !== activeDropdown.row ||
      prevActiveDropdown.current.col !== activeDropdown.col
    ) {
      setVisible(false);
      setLoading(true);
      const timer = setTimeout(() => setVisible(true), dropDownDelay);

      // Update ref 
      prevActiveDropdown.current = { row: activeDropdown.row, col: activeDropdown.col };

      return () => clearTimeout(timer);
    } else {
      // If position is same (just options updated), ensure visible and not loading
      setVisible(true);
      setLoading(false);
    }

  }, [activeDropdown, activeDropdown.filteredOptions.length, gridConfigVals, gridConfigVals.length, tableRef, position]);

  // Auto-close on scroll/resize
  useEffect(() => {
    if (!activeDropdown) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest(".dropdown-menu")) return;
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

  if (!activeDropdown || !tableEditable || !adjustedPosition || !visible) {
    return loading ? <div
      className="dropdown-menu"
      style={{
        position: "fixed",
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        width: `${adjustedPosition.width}px`,
        maxHeight: activeDropdown.filteredOptions.length === 1 ? '40vh' : `${adjustedPosition.maxHeight}px`,
        overflowY: "auto",
        zIndex: 1001,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dropdown-loader" >
        <div className="spinner" />
        <span>Loading options...</span>
      </div>
    </div> :
      null

  }


  return (
    <div
      className={`dropdown-menu`}
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
        zIndex: 1001,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {gridConfigVals && gridConfigVals.length > 0 ? (
        gridConfigVals.map((option, idx) => (
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
