import type { SabnzbdHistorySlot } from "../../api/slskd/types";
import { getDownloadTransfers } from "../../api/slskd/transfer";
import { getAllDownloads } from "../../api/slskd/downloadTracker";
import { aggregateStatus } from "../../api/slskd/statusMap";
import { getSlskdConfig } from "../../api/slskd/config";
import { findMatchingTransfers } from "./transfers";

export async function getHistorySlots(): Promise<SabnzbdHistorySlot[]> {
  const transferGroups = await getDownloadTransfers();
  const tracked = getAllDownloads();
  const { downloadPath } = getSlskdConfig();
  const slots: SabnzbdHistorySlot[] = [];

  for (const dl of tracked) {
    const transfers = findMatchingTransfers(
      dl.username,
      dl.files,
      transferGroups
    );
    const status = aggregateStatus(transfers);

    if (status !== "Completed" && status !== "Failed") continue;

    slots.push({
      nzo_id: dl.nzoId,
      name: dl.title,
      category: dl.category,
      bytes: dl.totalSize,
      status,
      completed: Math.floor(Date.now() / 1000),
      storage: `${downloadPath}/${dl.title}`,
    });
  }

  return slots;
}
