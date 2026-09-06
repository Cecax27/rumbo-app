import { describe, it, expect } from "vitest"
import { checkAndSync } from "./sync"
import type { ContentCache, ContentCacheEntry, ContentFetcher } from "./sync"
import type { LearningContent } from "./types"

function makeContent(): LearningContent {
  return { levels: [], topics: [] }
}

class FakeCache implements ContentCache {
  entries: ContentCacheEntry[] = []
  failGet = false
  failSet = false
  async get() {
    if (this.failGet) throw new Error("cache get failed")
    return this.entries[this.entries.length - 1] ?? null
  }
  async set(entry: ContentCacheEntry) {
    if (this.failSet) throw new Error("cache set failed")
    this.entries.push(entry)
  }
}

function fetcher(overrides: Partial<ContentFetcher> = {}): ContentFetcher & {
  fetchCalls: number
} {
  const f = {
    fetchCalls: 0,
    getRemoteVersion: async () => 5,
    fetchContent: async () => {
      f.fetchCalls += 1
      return makeContent()
    },
    ...overrides,
  }
  return f
}

describe("checkAndSync", () => {
  it("no-ops (up_to_date) when versions match", async () => {
    const cache = new FakeCache()
    cache.entries.push({ version: 5, content: makeContent() })
    const f = fetcher({ getRemoteVersion: async () => 5 })

    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("up_to_date")
    expect(f.fetchCalls).toBe(0)
  })

  it("fetches and caches when remote is newer", async () => {
    const cache = new FakeCache()
    cache.entries.push({ version: 1, content: makeContent() })
    const f = fetcher({ getRemoteVersion: async () => 2 })

    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("updated")
    expect(f.fetchCalls).toBe(1)
    expect(cache.entries[1]?.version).toBe(2)
  })

  it("keeps cached content when the fetch fails", async () => {
    const cache = new FakeCache()
    cache.entries.push({ version: 1, content: makeContent() })
    const f = fetcher({
      getRemoteVersion: async () => 2,
      fetchContent: async () => {
        throw new Error("network")
      },
    })

    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("error")
    expect(result.content).not.toBeNull()
  })

  it("reports an error when version check fails with no cache", async () => {
    const cache = new FakeCache()
    const f = fetcher({
      getRemoteVersion: async () => {
        throw new Error("version")
      },
    })

    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("error")
    expect(result.content).toBeNull()
  })

  it("does not regress to an older remote version", async () => {
    const cache = new FakeCache()
    cache.entries.push({ version: 10, content: makeContent() })
    const f = fetcher({ getRemoteVersion: async () => 9 })

    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("up_to_date")
    expect(f.fetchCalls).toBe(0)
  })

  it("still fetches on first run even if a cache miss, same version", async () => {
    const cache = new FakeCache()
    const f = fetcher({ getRemoteVersion: async () => 5 })
    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("updated")
  })

  it("survives a cache read exception", async () => {
    const cache = new FakeCache()
    cache.failGet = true
    const f = fetcher({ getRemoteVersion: async () => 5 })
    const result = await checkAndSync(cache, f)
    expect(result.status).toBe("updated")
  })
})
