import { useState } from "react";

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

const activeClass = "bg-amber-400 text-black";
const inactiveClass =
  "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";

function FilterGroupButtons({
  group,
  value,
  onChange,
}: {
  group: FilterGroup;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {group.label && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
          {group.label}
        </span>
      )}
      <div className="flex gap-1.5">
        {group.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-black shadow-cartoon-sm hover:translate-y-[-1px] hover:shadow-cartoon-md active:translate-y-[1px] active:shadow-cartoon-pressed transition-all whitespace-nowrap ${
              value === option.value ? activeClass : inactiveClass
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({
  filters,
  values,
  onChange,
  search,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {search && <SearchForm {...search} />}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {filters.map((group) => (
          <FilterGroupButtons
            key={group.key}
            group={group}
            value={values[group.key]}
            onChange={(value) => onChange(group.key, value)}
          />
        ))}
      </div>
    </div>
  );
}
