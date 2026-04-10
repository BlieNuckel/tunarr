import type { PurchaseDecisionConfig } from "../../config";
import type { PurchaseData, Signal } from "./types";

/** Parse a MusicBrainz date ("YYYY", "YYYY-MM", or "YYYY-MM-DD") into a Date */
function parseReleaseDate(dateStr: string): Date | null {
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 0 || Number.isNaN(parts[0])) return null;

  const year = parts[0];
  const month = (parts[1] ?? 1) - 1;
  const day = parts[2] ?? 1;
  return new Date(year, month, day);
}

function yearsSince(date: Date, now: Date): number {
  const ms = now.getTime() - date.getTime();
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}

export function evaluateAge(
  data: PurchaseData,
  config: PurchaseDecisionConfig
): Signal | null {
  if (!data.firstReleaseDate || config.oldReleaseThresholdYears <= 0) {
    return null;
  }

  const releaseDate = parseReleaseDate(data.firstReleaseDate);
  if (!releaseDate) return null;

  const years = yearsSince(releaseDate, new Date());
  if (years < 0) return null;

  if (years >= config.oldReleaseThresholdYears) {
    const releaseYear = data.firstReleaseDate.split("-")[0];
    return {
      factor: "age",
      recommendation: "request",
      reason: `Released in ${releaseYear} — the artist may no longer benefit from sales`,
    };
  }

  return null;
}
