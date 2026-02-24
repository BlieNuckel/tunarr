import type { SlskdTransfer, SlskdTransferGroup } from "../../api/slskd/types";
import { mapTransferState } from "../../api/slskd/statusMap";

export function findMatchingTransfers(
  username: string,
  files: { filename: string }[],
  transferGroups: SlskdTransferGroup[]
): SlskdTransfer[] {
  const filenames = new Set(files.map((f) => f.filename));
  const matches: SlskdTransfer[] = [];

  for (const group of transferGroups) {
    if (group.username !== username) continue;
    for (const dir of group.directories) {
      for (const transfer of dir.files) {
        if (filenames.has(transfer.filename)) {
          matches.push(transfer);
        }
      }
    }
  }

  return matches;
}

export function estimateTimeLeft(transfers: SlskdTransfer[]): string {
  const activeTransfers = transfers.filter(
    (t) => mapTransferState(t.state) === "Downloading"
  );
  if (activeTransfers.length === 0) return "00:00:00";

  const totalRemaining = activeTransfers.reduce(
    (sum, t) => sum + (t.size - t.bytesTransferred),
    0
  );
  const totalSpeed = activeTransfers.reduce(
    (sum, t) => sum + t.averageSpeed,
    0
  );

  if (totalSpeed <= 0) return "99:99:99";

  const seconds = Math.ceil(totalRemaining / totalSpeed);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function extractDirectoryName(filename: string): string {
  const lastSlash = Math.max(
    filename.lastIndexOf("\\"),
    filename.lastIndexOf("/")
  );
  if (lastSlash === -1) return filename;
  const dir = filename.slice(0, lastSlash);
  const parentSlash = Math.max(dir.lastIndexOf("\\"), dir.lastIndexOf("/"));
  return parentSlash === -1 ? dir : dir.slice(parentSlash + 1);
}
