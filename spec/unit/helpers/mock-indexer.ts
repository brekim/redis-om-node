import { vi } from 'vitest'

vi.mock('$lib/indexer', () => ({
  buildRediSearchIndex: vi.fn()
}))

