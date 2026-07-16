import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { generationApi } from '../api'

const PAGE_SIZE = 8

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HistoryPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const load = useCallback(async (pageNum) => {
    setIsLoading(true)
    setError(null)
    try {
      const { items, total } = await generationApi.list(pageNum, PAGE_SIZE)
      setItems(items)
      setTotal(total)
    } catch (err) {
      setError(err.message || 'Could not load your history.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [page, load])

  async function handleDelete(id) {
    setRemovingId(id)
    try {
      await generationApi.remove(id)
      setItems((prev) => prev.filter((g) => g.id !== id))
      setTotal((t) => t - 1)
    } catch (err) {
      setError(err.message || 'Could not delete this generation.')
    } finally {
      setRemovingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-marker">History</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-chalk">Your generations</h1>
        </div>
        <Link to="/studio" className="btn-secondary">
          + New generation
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-panel" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M5 26C7 15, 12 6, 18 6C24 6, 26 11, 31 9"
              stroke="#8B8790"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
          </svg>
          <p className="font-display text-chalk">No generations yet</p>
          <p className="max-w-sm text-sm text-graphite">
            Once you generate an image from a sketch, it'll show up here with the original line art alongside every variation.
          </p>
          <Link to="/studio" className="btn-primary mt-2">
            Create your first generation
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((gen) => (
              <div key={gen.id} className="card overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-panelBorder">
                  <img src={gen.sketchUrl} alt="Sketch" className="aspect-square object-cover" />
                  <img src={gen.results?.[0]?.thumbUrl} alt="Result" className="aspect-square object-cover" />
                </div>
                <div className="flex items-center justify-between px-3.5 py-3">
                  <div>
                    <p className="font-display text-sm text-chalk capitalize">{gen.style}</p>
                    <p className="font-mono text-[11px] text-graphite">{formatDate(gen.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(gen.id)}
                    disabled={removingId === gen.id}
                    className="rounded-md px-2.5 py-1.5 font-mono text-xs text-graphite transition-colors hover:text-danger disabled:opacity-40"
                  >
                    {removingId === gen.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary !px-3.5 !py-2 text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <span className="font-mono text-xs text-graphite">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary !px-3.5 !py-2 text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
