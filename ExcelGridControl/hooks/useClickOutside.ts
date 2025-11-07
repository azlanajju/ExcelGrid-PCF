import { useEffect } from "react";

export function useClickOutside(className: string, onOutsideClick: () => void = (()=>{})) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const insideElement = target.closest("." + className);

      if (!insideElement) {
        onOutsideClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [className, onOutsideClick]);
}
