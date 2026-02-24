import type { GroupedSearchResult } from "../../api/slskd/types";
import {
  startSearch,
  waitForSearch,
  getSearchResponses,
  deleteSearch,
} from "../../api/slskd/search";
import { groupSearchResults } from "../../api/slskd/groupResults";
import { createLogger } from "../../logger";

type CachedResult = { result: GroupedSearchResult; expiresAt: number };
type CachedSearch = { results: GroupedSearchResult[]; expiresAt: number };

const resultCache = new Map<string, CachedResult>();
const searchCache = new Map<string, CachedSearch>();

const CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_LIMIT = 100;

const log = createLogger("Torznab");

export function cleanExpiredCaches(): void {
  const now = Date.now();
  for (const [key, entry] of resultCache) {
    if (entry.expiresAt < now) resultCache.delete(key);
  }
  for (const [key, entry] of searchCache) {
    if (entry.expiresAt < now) searchCache.delete(key);
  }
}

export function getCachedResult(guid: string): GroupedSearchResult | null {
  const cached = resultCache.get(guid);
  return cached ? cached.result : null;
}

export function cacheResultsForDownload(results: GroupedSearchResult[]): void {
  const now = Date.now();
  for (const result of results) {
    resultCache.set(result.guid, { result, expiresAt: now + CACHE_TTL_MS });
  }
}

export async function getOrSearchResults(
  query: string
): Promise<GroupedSearchResult[]> {
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    log.info(
      `Search "${query}": serving from cache (${cached.results.length} results)`
    );
    return cached.results;
  }

  log.info(`Searching slskd for: "${query}"`);

  const searchState = await startSearch(query);
  const waitResult = await waitForSearch(searchState.id);

  if (!waitResult.completed) {
    log.warn(`Search timed out for "${query}", returning partial results`);
  }

  const responses = await getSearchResponses(searchState.id);
  log.info(
    `Search "${query}": ${responses.length} responses, ${responses.reduce((n, r) => n + r.fileCount, 0)} files`
  );
  deleteSearch(searchState.id).catch(() => {});

  const results = groupSearchResults(responses);
  log.info(
    `Search "${query}": ${results.length} grouped results after filtering`
  );

  cleanExpiredCaches();
  searchCache.set(cacheKey, {
    results,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return results;
}

export function buildSearchQuery(params: {
  q?: string;
  artist?: string;
  album?: string;
}): string {
  if (params.q) return params.q;
  if (params.artist && params.album) return `${params.artist} ${params.album}`;
  if (params.artist) return params.artist;
  return "";
}

export { DEFAULT_LIMIT };
