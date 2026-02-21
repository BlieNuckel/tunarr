interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export type CachedFn<TArgs extends unknown[], TReturn> = ((
  ...args: TArgs
) => Promise<TReturn>) & { clearCache: () => void };

/**
 * Wraps an async function with caching. On cache hit, returns the cached value
 * without calling the underlying function.
 * @param fn - The async function to wrap
 * @param options.cache - ApiCache instance to use
 * @param options.key - Function to derive a cache key from the arguments
 * @param options.ttlMs - Time-to-live in milliseconds for cached entries
 */
export function withCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: {
    cache: ApiCache;
    key: (...args: TArgs) => string;
    ttlMs: number;
    label?: string;
  }
): CachedFn<TArgs, TReturn> {
  const wrapped = async (...args: TArgs): Promise<TReturn> => {
    const cacheKey = options.key(...args);
    const cached = options.cache.get<TReturn>(cacheKey);
    if (cached !== undefined) {
      if (options.label) {
        console.log(`[${options.label}] Cache hit for ${cacheKey}`);
      }
      return cached;
    }

    const result = await fn(...args);
    options.cache.set(cacheKey, result, options.ttlMs);
    return result;
  };

  wrapped.clearCache = () => options.cache.clear();

  return wrapped as CachedFn<TArgs, TReturn>;
}
