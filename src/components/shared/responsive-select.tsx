"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface OptionItem {
  label: string;
  value: string;
}

interface ResponsiveSelectProps {
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: (OptionItem | string)[];
  placeholder?: string;
  value: string;
}

/**
 * Selector desplegable responsive y estilizado que respeta estrictamente
 * los límites de pantalla en mobile/tablet/desktop, evitando que el menú
 * nativo del sistema operativo desborde el ancho del contenedor.
 */
export function ResponsiveSelect({
  className,
  disabled,
  onChange,
  options,
  placeholder = "Seleccionar",
  value,
}: ResponsiveSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const currentOption = normalizedOptions.find((opt) => opt.value === value);
  const displayText = currentOption?.label || (value ? value : placeholder);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full min-w-0" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "w-full min-w-0 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed",
          !value && "text-gray-400",
          className,
        )}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="truncate mr-2">{displayText}</span>
        <ChevronDown
          className={cn(
            "text-gray-400 transition-transform duration-200 flex-shrink-0",
            open && "rotate-180 text-blue-600",
          )}
          size={16}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1 divide-y divide-gray-50"
          role="listbox"
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "w-full px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors",
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                role="option"
                type="button"
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="text-blue-600 flex-shrink-0 ml-2" size={15} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
