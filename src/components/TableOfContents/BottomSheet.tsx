import { ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const SWIPE_DOWN_THRESHOLD = 80;

export default function BottomSheet({
  isOpen,
  onClose,
  children,
}: BottomSheetProps) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const touchStartY = useRef(0);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setClosing(!isOpen);
  }

  if (!isOpen && !closing) return null;

  return createPortal(
    <div
      data-testid="bottom-sheet-backdrop"
      className={`fixed inset-0 z-50 bg-black/60 dark:bg-black/80 ${
        closing ? "animate-backdrop-out" : "animate-backdrop-in"
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl border-t-3 border-x-3 border-black pb-24 md:pb-6 ${
          closing ? "animate-sheet-down" : "animate-sheet-up"
        }`}
        onAnimationEnd={() => {
          if (closing) setClosing(false);
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const deltaY = e.changedTouches[0].clientY - touchStartY.current;
          if (deltaY > SWIPE_DOWN_THRESHOLD) {
            onClose();
          }
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
