type TocSection = {
  id: string;
  label: string;
  group?: string;
};

interface TocListProps {
  sections: TocSection[];
  activeSection: string | null;
  onSelect: (id: string) => void;
}

export type { TocSection };

export default function TocList({
  sections,
  activeSection,
  onSelect,
}: TocListProps) {
  return (
    <nav aria-label="Table of contents">
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSelect(section.id)}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === section.id
                  ? "font-bold text-amber-600 dark:text-amber-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {activeSection === section.id && (
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
              )}
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
