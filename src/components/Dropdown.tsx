import { useState, useEffect, useRef, useCallback } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
} from "@floating-ui/react-dom";
import { ChevronDownIcon } from "@/components/icons";
import useHaptics from "../hooks/useHaptics";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
}: DropdownProps) {
  const haptics = useHaptics();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [referenceEl, setReferenceEl] = useState<HTMLElement | null>(null);
  const [floatingEl, setFloatingEl] = useState<HTMLElement | null>(null);

  const setSearchRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    setReferenceEl(node);
  }, []);

  const { floatingStyles, placement } = useFloating({
    elements: { reference: referenceEl, floating: floatingEl },
    placement: "bottom-start",
    transform: false,
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filteredOptions =
    searchable && filter
      ? options.filter((o) =>
          o.label.toLowerCase().includes(filter.toLowerCase())
        )
      : options;

  const triggerClasses =
    "w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-black rounded-lg text-base sm:text-sm text-left shadow-cartoon-md focus:outline-none focus:border-amber-400";

  const originClass = placement.startsWith("top")
    ? "origin-bottom"
    : "origin-top";

  return (
    <div ref={wrapperRef}>
      {searchable ? (
        <input
          ref={setSearchRef}
          type="text"
          value={open ? filter : (selectedLabel ?? "")}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => {
            setOpen(true);
            setFilter("");
          }}
          placeholder={placeholder}
          className={`${triggerClasses} text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600`}
        />
      ) : (
        <button
          ref={setReferenceEl}
          type="button"
          onClick={() => {
            haptics.light();
            setOpen(!open);
          }}
          className={`${triggerClasses} flex items-center justify-between`}
        >
          <span
            className={
              selectedLabel
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }
          >
            {selectedLabel || placeholder}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
      {open && (
        <div
          ref={setFloatingEl}
          style={floatingStyles}
          className={`z-10 bg-white dark:bg-gray-800 rounded-xl border-2 border-black p-2 shadow-cartoon-lg animate-dropdown-in ${originClass}`}
        >
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm px-3 py-2">
                No matches
              </p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    haptics.light();
                    onChange(option.value);
                    setOpen(false);
                    setFilter("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    value === option.value
                      ? "bg-amber-300 text-black font-bold dark:text-black"
                      : "text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
