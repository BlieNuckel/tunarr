import { lidarrGet } from "../../api/lidarr/get.js";
import type {
  LidarrPaginatedResponse,
  LidarrHistoryRecord,
} from "../../api/lidarr/types";

type EnrichedHistoryRecord = Omit<
  LidarrHistoryRecord,
  "downloadId" | "data"
> & {
  sourceIndexer: string | null;
};

export function buildIndexerMap(
  grabbedRecords: LidarrHistoryRecord[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const record of grabbedRecords) {
    if (record.downloadId && record.data?.indexer) {
      map.set(record.downloadId, record.data.indexer);
    }
  }
  return map;
}

export function enrichRecords(
  importedRecords: LidarrHistoryRecord[],
  indexerMap: Map<string, string>
): EnrichedHistoryRecord[] {
  return importedRecords.map(({ downloadId, data: _, ...rest }) => ({
    ...rest,
    sourceIndexer: indexerMap.get(downloadId) ?? null,
  }));
}

export async function getEnrichedHistory(
  page: string | number,
  pageSize: string | number
) {
  const baseQuery = {
    page,
    pageSize,
    includeArtist: true,
    includeAlbum: true,
    sortKey: "date",
    sortDirection: "descending",
  };

  const [importedResult, grabbedResult] = await Promise.all([
    lidarrGet<LidarrPaginatedResponse<LidarrHistoryRecord>>("/history", {
      ...baseQuery,
      eventType: 3,
    }),
    lidarrGet<LidarrPaginatedResponse<LidarrHistoryRecord>>("/history", {
      ...baseQuery,
      eventType: 1,
    }).catch(() => null),
  ]);

  const indexerMap = buildIndexerMap(grabbedResult?.data?.records ?? []);
  const enrichedRecords = enrichRecords(
    importedResult.data.records,
    indexerMap
  );

  return {
    status: importedResult.status,
    data: {
      ...importedResult.data,
      records: enrichedRecords,
    },
  };
}
