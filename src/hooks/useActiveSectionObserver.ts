import { useRef, useCallback, useState, useEffect } from "react";

type SectionRefs = Record<string, (el: HTMLElement | null) => void>;

type ActiveSectionResult = {
  activeSection: string | null;
  sectionRefs: SectionRefs;
};

function buildRefCallbacks(
  sectionIds: string[],
  elements: React.MutableRefObject<Map<string, HTMLElement>>
): SectionRefs {
  const refs: SectionRefs = {};
  for (const id of sectionIds) {
    refs[id] = (el: HTMLElement | null) => {
      if (el) elements.current.set(id, el);
      else elements.current.delete(id);
    };
  }
  return refs;
}

export default function useActiveSectionObserver(
  sectionIds: string[]
): ActiveSectionResult {
  const elements = useRef<Map<string, HTMLElement>>(new Map());
  const [activeSection, setActiveSection] = useState<string | null>(
    sectionIds[0] ?? null
  );

  const sectionRefs = useCallback(
    () => buildRefCallbacks(sectionIds, elements),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionIds.join(",")]
  );

  useEffect(() => {
    const visibleEntries = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleEntries.set(entry.target.id, entry);
          } else {
            visibleEntries.delete(entry.target.id);
          }
        }

        const topmost = sectionIds.find((id) => visibleEntries.has(id));
        if (topmost) setActiveSection(topmost);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    for (const el of elements.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(",")]);

  return { activeSection, sectionRefs: sectionRefs() };
}
