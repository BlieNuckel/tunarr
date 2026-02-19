import { useState, SubmitEvent } from "react";
import Dropdown from "@/components/Dropdown";

interface SearchBarProps {
  onSearch: (query: string, searchType: string) => void;
  initialQuery?: string;
  initialSearchType?: string;
}

export default function SearchBar({
  onSearch,
  initialQuery = "",
  initialSearchType = "album",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(initialSearchType);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, searchType);
    }
  };

  return (
    <form
      data-testid="search-form"
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Search by
        </label>
        <Dropdown
          options={[
            { value: "album", label: "Album" },
            { value: "artist", label: "Artist" },
          ]}
          value={searchType}
          onChange={setSearchType}
        />
      </div>

      <div className="flex gap-2">
        <input
          data-testid="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-4 py-2 bg-white border-2 border-black rounded-lg text-gray-900 placeholder-gray-200 focus:outline-none focus:border-amber-400 shadow-cartoon-md"
        />
        <button
          type="submit"
          className="px-3 sm:px-6 py-2 bg-pink-400 hover:bg-pink-300 text-black font-bold rounded-lg border-2 border-black shadow-cartoon-md hover:translate-y-[-1px] hover:shadow-cartoon-lg active:translate-y-[1px] active:shadow-cartoon-pressed transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 sm:hidden"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
