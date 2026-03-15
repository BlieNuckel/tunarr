import TocList from "./TocList";
import type { TocSection } from "./TocList";

interface DesktopTocProps {
  sections: TocSection[];
  activeSection: string | null;
  onSelect: (id: string) => void;
}

export default function DesktopToc({
  sections,
  activeSection,
  onSelect,
}: DesktopTocProps) {
  return (
    <aside className="hidden md:block w-48 shrink-0 sticky top-0 self-start">
      <TocList
        sections={sections}
        activeSection={activeSection}
        onSelect={onSelect}
      />
    </aside>
  );
}
