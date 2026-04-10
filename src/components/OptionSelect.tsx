import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";
import { EllipsisVerticalIcon } from "@/components/icons";
import BottomSheet from "./BottomSheet";

interface Option {
  label: string;
  onClick: () => void;
}

interface OptionSelectProps {
  options: Option[];
  title?: string;
  align?: "left" | "right";
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => !window.matchMedia("(min-width: 640px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  isOpen: boolean,
  onClose: () => void
) {
  const stableOnClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const listener = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      stableOnClose();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [isOpen, refs, stableOnClose]);
}

function OptionList({
  options,
  onClose,
}: {
  options: Option[];
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => {
            option.onClick();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Popup({
  anchorRef,
  anchorEl,
  isOpen,
  onClose,
  options,
  title,
  align,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  options: Option[];
  title?: string;
  align: "left" | "right";
}) {
  const isMobile = useIsMobile();
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const [floatingEl, setFloatingEl] = useState<HTMLElement | null>(null);

  const setFloating = useCallback((node: HTMLDivElement | null) => {
    floatingRef.current = node;
    setFloatingEl(node);
  }, []);

  const { floatingStyles, placement } = useFloating({
    elements: { reference: anchorEl, floating: floatingEl },
    placement: align === "right" ? "bottom-end" : "bottom-start",
    strategy: "fixed",
    transform: false,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  useClickOutside([anchorRef, floatingRef], isOpen && !isMobile, onClose);

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        <OptionList options={options} onClose={onClose} />
      </BottomSheet>
    );
  }

  if (!isOpen) return null;

  const originClass = placement.startsWith("top")
    ? "origin-bottom"
    : "origin-top";

  return createPortal(
    <div
      ref={setFloating}
      style={floatingStyles}
      className={`min-w-48 bg-white dark:bg-gray-800 border-2 border-black rounded-xl shadow-cartoon-lg py-1 z-50 animate-dropdown-in ${originClass}`}
    >
      <OptionList options={options} onClose={onClose} />
    </div>,
    document.body
  );
}

export default function OptionSelect({
  options,
  title,
  align = "right",
}: OptionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setIsOpen(false), []);

  const setTrigger = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    setTriggerEl(node);
  }, []);

  return (
    <>
      <button
        ref={setTrigger}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="More options"
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>
      <Popup
        anchorRef={triggerRef}
        anchorEl={triggerEl}
        isOpen={isOpen}
        onClose={close}
        options={options}
        title={title}
        align={align}
      />
    </>
  );
}

export type { Option, OptionSelectProps };
