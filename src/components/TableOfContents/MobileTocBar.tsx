import { useState, useEffect } from "react";
import BottomSheet from "./BottomSheet";
import TocList from "./TocList";
import type { TocSection } from "./TocList";

interface MobileTocBarProps {
  sections: TocSection[];
  activeSection: string | null;
  onSelect: (id: string) => void;
}

function findActiveLabel(
  sections: TocSection[],
  activeSection: string | null
): string {
  const match = sections.find((s) => s.id === activeSection);
  return match?.label ?? "";
}

const SWIPE_THRESHOLD = 50;
const BOTTOM_ZONE = 120;

export default function MobileTocBar({
  sections,
  activeSection,
  onSelect,
}: MobileTocBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let startY = 0;
    let startX = 0;

    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (window.innerHeight - touch.clientY < BOTTOM_ZONE) {
        startY = touch.clientY;
        startX = touch.clientX;
      } else {
        startY = 0;
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (startY === 0) return;
      const touch = e.changedTouches[0];
      const deltaY = startY - touch.clientY;
      const deltaX = Math.abs(touch.clientX - startX);
      if (deltaY > SWIPE_THRESHOLD && deltaY > deltaX) {
        setSheetOpen(true);
      }
      startY = 0;
    }

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleSelect = (id: string) => {
    setSheetOpen(false);
    onSelect(id);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 z-40 flex justify-center px-10 animate-toc-bar-pop">
        <button
          onClick={() => setSheetOpen(true)}
          className="w-full flex items-center justify-between px-4 pt-0.5 pb-3 bg-white dark:bg-gray-800 border-2 border-black rounded-t-lg"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
              {findActiveLabel(sections, activeSection)}
            </span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-gray-400 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
        <TocList
          sections={sections}
          activeSection={activeSection}
          onSelect={handleSelect}
        />
      </BottomSheet>
    </>
  );
}
