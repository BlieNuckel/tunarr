import { useState, useEffect, useRef } from "react";

interface LibraryArtist {
  id: number;
  name: string;
  foreignArtistId: string;
}

interface LibraryPickerProps {
  artists: LibraryArtist[];
  loading: boolean;
  selectedArtist: string | null;
  onSelect: (name: string) => void;
}

export default function LibraryPicker({
  artists,
  loading,
  selectedArtist,
  onSelect,
}: LibraryPickerProps) {
  const [filter, setFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredArtists = filter
    ? artists.filter((a) => a.name.toLowerCase().includes(filter.toLowerCase()))
    : artists;

  return (
    <div className="lg:col-span-1" ref={dropdownRef}>
      <h2 className="text-sm font-medium text-gray-500 mb-2">Your Library</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading library...</p>
      ) : artists.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No artists in library. Connect Lidarr in Settings.
        </p>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search library..."
            className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-gray-900 placeholder-gray-200 focus:outline-none focus:border-amber-400 text-sm shadow-cartoon-md"
          />
          {dropdownOpen && (
            <div className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto space-y-1 bg-white rounded-xl border-2 border-black p-2 shadow-cartoon-lg">
              {filteredArtists.length === 0 ? (
                <p className="text-gray-400 text-sm px-3 py-2">No matches</p>
              ) : (
                filteredArtists.map((artist) => (
                  <button
                    key={artist.id}
                    onClick={() => {
                      onSelect(artist.name);
                      setFilter("");
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedArtist === artist.name
                        ? "bg-amber-300 text-black font-bold"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    {artist.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
