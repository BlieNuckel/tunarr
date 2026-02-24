import { decodeNzb } from "../../api/slskd/nzb";
import { enqueueDownload } from "../../api/slskd/transfer";
import { addDownload } from "../../api/slskd/downloadTracker";
import { extractDirectoryName } from "./transfers";

export async function processAddFile(
  nzbXml: string,
  category: string
): Promise<{ nzoId: string; title: string }> {
  const metadata = decodeNzb(nzbXml);
  const nzoId = `slskd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const title = metadata.files[0]?.filename
    ? extractDirectoryName(metadata.files[0].filename)
    : "Unknown";

  await enqueueDownload(metadata.username, metadata.files);

  addDownload({
    nzoId,
    title,
    category,
    username: metadata.username,
    files: metadata.files,
    totalSize: metadata.files.reduce((sum, f) => sum + f.size, 0),
    addedAt: Date.now(),
  });

  return { nzoId, title };
}
