interface MineAllToggleProps {
  showAll: boolean;
  onToggle: (showAll: boolean) => void;
}

export default function MineAllToggle({
  showAll,
  onToggle,
}: MineAllToggleProps) {
  const baseClass =
    "px-4 py-2 text-sm font-bold rounded-lg border-2 border-black transition-all";
  const activeClass = "bg-pink-400 text-black shadow-cartoon-sm";
  const inactiveClass =
    "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-gray-700";

  return (
    <div className="flex gap-2" role="tablist">
      <button
        role="tab"
        aria-selected={!showAll}
        onClick={() => onToggle(false)}
        className={`${baseClass} ${!showAll ? activeClass : inactiveClass}`}
      >
        My Requests
      </button>
      <button
        role="tab"
        aria-selected={showAll}
        onClick={() => onToggle(true)}
        className={`${baseClass} ${showAll ? activeClass : inactiveClass}`}
      >
        All Requests
      </button>
    </div>
  );
}
