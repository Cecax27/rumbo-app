import type { LearningContent } from "./types"

/**
 * Content sync orchestration. The engine is platform-agnostic: it reads and
 * writes through an injected `ContentCache` adapter (AsyncStorage/File for
 * mobile, IndexedDB/localStorage for web) and fetches through an injected
 * fetcher (implemented over `@repo/supabase`).
 *
 * Version policy: a strictly greater remote version triggers a fetch; equal or
 * older versions leave the cache untouched (cached content never regresses).
 */

export interface ContentCacheEntry {
  version: number
  content: LearningContent
}

export interface ContentCache {
  get(): Promise<ContentCacheEntry | null>
  set(entry: ContentCacheEntry): Promise<void>
}

export interface ContentFetcher {
  /** Returns the latest published content version from the server. */
  getRemoteVersion(): Promise<number>
  /** Fetches the full published content set. */
  fetchContent(): Promise<LearningContent>
}

export type SyncResult =
  | { status: "up_to_date"; content: LearningContent | null }
  | { status: "updated"; content: LearningContent }
  | { status: "error"; content: LearningContent | null; error: string }

/**
 * Checks the remote version against the cache and updates if newer. Guarantees
 * that a fetch failure never discards cached content.
 */
export async function checkAndSync(
  cache: ContentCache,
  fetcher: ContentFetcher,
): Promise<SyncResult> {
  let cacheEntry: ContentCacheEntry | null = null
  try {
    cacheEntry = await cache.get()
  } catch {
    cacheEntry = null
  }

  const cachedVersion = cacheEntry?.version ?? 0

  let remoteVersion: number
  try {
    remoteVersion = await fetcher.getRemoteVersion()
  } catch (error) {
    return {
      status: "error",
      content: cacheEntry?.content ?? null,
      error: error instanceof Error ? error.message : "version check failed",
    }
  }

  if (remoteVersion <= cachedVersion && cacheEntry) {
    return { status: "up_to_date", content: cacheEntry.content }
  }
  if (remoteVersion <= cachedVersion && !cacheEntry) {
    // No cache and remote is stale/zero: attempt to fetch anyway so first runs
    // with a misconfigured version still try to get content.
    return doFetch(cache, fetcher, remoteVersion, cacheEntry)
  }

  return doFetch(cache, fetcher, remoteVersion, cacheEntry)
}

async function doFetch(
  cache: ContentCache,
  fetcher: ContentFetcher,
  remoteVersion: number,
  cacheEntry: ContentCacheEntry | null,
): Promise<SyncResult> {
  let content: LearningContent
  try {
    content = await fetcher.fetchContent()
  } catch (error) {
    return {
      status: "error",
      content: cacheEntry?.content ?? null,
      error: error instanceof Error ? error.message : "content fetch failed",
    }
  }

  const entry: ContentCacheEntry = { version: remoteVersion, content }
  try {
    await cache.set(entry)
  } catch {
    // Cache write failure is non-fatal: still return the fresh content.
  }

  return { status: "updated", content }
}
