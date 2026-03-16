import { useState, useRef, useEffect } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  key: string;
  label?: string;
  options: FilterOption[];
}

interface SearchConfig {
  placeholder: string;
  onSearch: (query: string) => void;
}

interface FilterBarProps {
  filters: FilterGroup[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  search?: SearchConfig;
}

function SearchForm({ placeholder, onSearch }: SearchConfig) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-black rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-400 shadow-cartoon-md text-[16px]"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg border-2 border-black shadow-cartoon-md hover:translate-y-[-1px] hover:shadow-cartoon-lg active:translate-y-[1px] active:shadow-cartoon-pressed transition-all"
      >
        Search
      </button>
    </form>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const pillActiveClass = "bg-amber-400 text-black";
const pillInactiveClass =
  "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";

function FilterPill({
  group,
  value,
  onChange,
  isExpanded,
  onToggle,
}: {
  group: FilterGroup;
  value: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isDefault = value === group.options[0]?.value;
  const activeLabel =
    group.options.find((o) => o.value === value)?.label ?? value;
  const pillText = group.label
    ? isDefault
      ? group.label
      : `${group.label}: ${activeLabel}`
    : activeLabel;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-black shadow-cartoon-sm hover:translate-y-[-1px] hover:shadow-cartoon-md active:translate-y-[1px] active:shadow-cartoon-pressed transition-all whitespace-nowrap ${
          !isDefault ? pillActiveClass : pillInactiveClass
        }`}
      >
        {pillText}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-1.5 z-10 bg-white dark:bg-gray-800 border-2 border-black rounded-lg p-1 shadow-cartoon-md animate-dropdown-in">
          {group.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`block w-full text-left px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                value === option.value
                  ? "bg-amber-400 text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function handleClickOutside(
  e: MouseEvent,
  containerRef: React.RefObject<HTMLDivElement | null>,
  close: () => void
) {
  if (
    containerRef.current &&
    !containerRef.current.contains(e.target as Node)
  ) {
    close();
  }
}

export default function FilterBar({
  filters,
  values,
  onChange,
  search,
}: FilterBarProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expandedKey) return;

    const listener = (e: MouseEvent) =>
      handleClickOutside(e, containerRef, () => setExpandedKey(null));

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [expandedKey]);

  const handleToggle = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleChange = (key: string, value: string) => {
    onChange(key, value);
    setExpandedKey(null);
  };

  const hasActiveFilters = filters.some(
    (group) => values[group.key] !== group.options[0]?.value
  );

  const handleReset = () => {
    for (const group of filters) {
      onChange(group.key, group.options[0]?.value ?? "all");
    }
    setExpandedKey(null);
  };

  return (
    <div className="space-y-2">
      {search && <SearchForm {...search} />}
      <div ref={containerRef} className="flex flex-wrap gap-2">
        {filters.map((group) => (
          <FilterPill
            key={group.key}
            group={group}
            value={values[group.key]}
            onChange={(value) => handleChange(group.key, value)}
            isExpanded={expandedKey === group.key}
            onToggle={() => handleToggle(group.key)}
          />
        ))}
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
