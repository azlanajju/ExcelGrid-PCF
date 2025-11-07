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
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  activeDropdown,
  onSelectOption,
  setActiveDropdown,
  position,
  tableEditable,
  tableRef,
  endSelection
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!tableRef.current || !activeDropdown) return;

    const dropdownHeight = activeDropdown.filteredOptions.length===0 ? 38 : activeDropdown.filteredOptions.length * 30 + 10;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let adjustedTop = position.top;
    let adjustedLeft = position.left;
    let maxHeight = dropdownHeight;

    // ✅ If dropdown would overflow bottom, move it above or shrink height
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

    // ✅ Prevent overflow on the right side
    if (position.left + position.width > viewportWidth) {
      adjustedLeft = Math.max(0, viewportWidth - position.width - 10);
    }

    setAdjustedPosition({
      top: adjustedTop,
      left: adjustedLeft,
      width: position.width,
      maxHeight,
    });

    // small delay before making dropdown visible
    const timer = setTimeout(() => setVisible(true), 35);

    return () => clearTimeout(timer);
  }, [position, activeDropdown, tableRef]);

  // 🔹 Auto-close on scroll/resize (except if scroll is inside dropdown)
  useEffect(() => {
    if (!activeDropdown) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement | Document;
      if (target instanceof HTMLElement && target.closest(".dropdown-menu")) {
        return; // ignore scrolls inside dropdown
      }
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

  // ❌ Don’t render until editable, dropdown active, position calculated, and visible
  if (!activeDropdown || !tableEditable || !adjustedPosition || !visible) {
    return null;
  }

  return (
    <div
      className="dropdown-menu"
      style={{
        position: "fixed",
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        width: `${adjustedPosition.width}px`,
        maxHeight: `${adjustedPosition.maxHeight}px`,
        overflowY: "auto",
        zIndex: 1001,
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
        // <div className="dropdown-option dropdown-no-options">
        //   No matching options
        // </div>

        <div className="dropdown-loader">
          <div className="spinner" />
          <span>Loading options...</span>
        </div>
      )}
    </div>
  );
};
