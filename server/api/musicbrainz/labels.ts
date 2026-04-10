import { MB_BASE, MB_HEADERS, rateLimitedMbFetch } from "./config";
import type { MusicBrainzLabelWithRels } from "./types";

type LabelInfo = { name: string; mbid: string };

const MAX_ANCESTOR_DEPTH = 5;

function extractParent(data: MusicBrainzLabelWithRels): LabelInfo | null {
  const ownerRel = data.relations?.find(
    (r) =>
      r.type === "label ownership" && r.direction === "backward" && !r.ended
  );
  if (!ownerRel) return null;
  return { name: ownerRel.label.name, mbid: ownerRel.label.id };
}

async function fetchLabelWithRels(
  labelMbid: string
): Promise<MusicBrainzLabelWithRels | null> {
  const url = `${MB_BASE}/label/${labelMbid}?inc=label-rels&fmt=json`;
  const response = await rateLimitedMbFetch(url, { headers: MB_HEADERS });
  if (!response.ok) return null;
  return response.json();
}

/** Walk the ownership chain upward, returning ancestors from nearest to farthest */
export async function getLabelAncestors(
  labelMbid: string
): Promise<LabelInfo[]> {
  const ancestors: LabelInfo[] = [];
  const visited = new Set<string>([labelMbid]);
  let currentMbid = labelMbid;

  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH; depth++) {
    const data = await fetchLabelWithRels(currentMbid);
    if (!data) break;

    const parent = extractParent(data);
    if (!parent || visited.has(parent.mbid)) break;

    ancestors.push(parent);
    visited.add(parent.mbid);
    currentMbid = parent.mbid;
  }

  return ancestors;
}
