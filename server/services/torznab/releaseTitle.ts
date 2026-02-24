const GENERIC_DIR_NAMES = new Set([
  "music",
  "downloads",
  "complete",
  "shared",
  "soulseek",
  "slsk",
  "incoming",
  "files",
  "media",
  "audio",
  "my music",
]);

export function buildReleaseTitle(directory: string): string {
  const parts = directory.split(/[/\\]/).filter(Boolean);
  const lastPart = parts[parts.length - 1] || directory;

  if (lastPart.includes(" - ")) return lastPart;

  for (let i = parts.length - 2; i >= 0; i--) {
    if (!GENERIC_DIR_NAMES.has(parts[i].toLowerCase())) {
      return `${parts[i]} - ${lastPart}`;
    }
  }

  return lastPart;
}
