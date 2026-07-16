import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Draggable divider comparing a sketch (left) against its realized image (right).
 * This is the app's signature interaction — reused in the hero, the studio
 * preview, and history detail views.
 */
export default function CompareSlider({ beforeSrc, afterSrc, beforeLabel = 'Sketch', afterLabel = 'Real' }) {
  const containerRef = useRef(null)
  const [position, setPosition] = useState(50)
  const draggingRef = useRef(false)

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, pct)))
  }, [])

  useEffect(() => {
    function onMove(e) {
      if (!draggingRef.current) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      updateFromClientX(clientX)
    }
    function onUp() {
      draggingRef.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [updateFromClientX])

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-lg border border-panelBorder bg-surface"
      onMouseDown={(e) => {
        draggingRef.current = true
        updateFromClientX(e.clientX)
      }}
      onTouchStart={(e) => {
        draggingRef.current = true
        updateFromClientX(e.touches[0].clientX)
      }}
    >
      <img src={afterSrc} alt={afterLabel} className="absolute inset-0 h-full w-full object-cover" draggable={false} />

      <div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="h-full w-full max-w-none object-cover"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
          draggable={false}
        />
      </div>

      <span className="absolute left-3 top-3 rounded bg-canvas/80 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-graphite backdrop-blur">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded bg-canvas/80 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-sageBright backdrop-blur">
        {afterLabel}
      </span>

      <div
        className="absolute inset-y-0 flex w-0.5 -translate-x-1/2 cursor-ew-resize items-center bg-marker"
        style={{ left: `${position}%` }}
      >
        <div className="flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-marker bg-canvas shadow-lg">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 3L1 7L4 11" stroke="#E8542A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 3L13 7L10 11" stroke="#E8542A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
