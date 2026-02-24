import type { SabnzbdQueueSlot } from "../../api/slskd/types";
import { getDownloadTransfers } from "../../api/slskd/transfer";
import { getAllDownloads } from "../../api/slskd/downloadTracker";
import { aggregateStatus } from "../../api/slskd/statusMap";
import { findMatchingTransfers, estimateTimeLeft } from "./transfers";

export async function getQueueSlots(): Promise<SabnzbdQueueSlot[]> {
  const transferGroups = await getDownloadTransfers();
  const tracked = getAllDownloads();
  const slots: SabnzbdQueueSlot[] = [];

  for (const dl of tracked) {
    const transfers = findMatchingTransfers(
      dl.username,
      dl.files,
      transferGroups
    );
    const status = aggregateStatus(transfers);

    if (status === "Completed" || status === "Failed") continue;

    const bytesTransferred = transfers.reduce(
      (sum, t) => sum + t.bytesTransferred,
      0
    );
    const remaining = dl.totalSize - bytesTransferred;
    const percentage =
      dl.totalSize > 0
        ? Math.round((bytesTransferred / dl.totalSize) * 100)
        : 0;

    slots.push({
      nzo_id: dl.nzoId,
      filename: dl.title,
      cat: dl.category,
      mb: (dl.totalSize / 1024 / 1024).toFixed(1),
      mbleft: (remaining / 1024 / 1024).toFixed(1),
      percentage: String(percentage),
      status,
      timeleft: estimateTimeLeft(transfers),
    });
  }

  return slots;
}
