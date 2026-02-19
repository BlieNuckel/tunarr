import { useState } from "react";

interface ArtistSearchFormProps {
  onSearch: (name: string) => void;
}

export default function ArtistSearchForm({ onSearch }: ArtistSearchFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="lg:col-span-2">
      <h2 className="text-sm font-medium text-gray-500 mb-2">
        Search any artist
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type an artist name..."
          className="flex-1 px-3 py-2 bg-white border-2 border-black rounded-lg text-gray-900 placeholder-gray-200 focus:outline-none focus:border-amber-400 text-sm shadow-cartoon-md"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-3 sm:px-4 py-2 bg-amber-300 hover:bg-amber-200 disabled:opacity-50 text-black font-bold rounded-lg text-sm border-2 border-black shadow-cartoon-md hover:translate-y-[-1px] hover:shadow-cartoon-lg active:translate-y-[1px] active:shadow-cartoon-pressed transition-all"
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
          <span className="hidden sm:inline">Find Similar</span>
        </button>
      </form>
    </div>
  );
}
