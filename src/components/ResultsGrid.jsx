export default function ResultsGrid({ results, sketchUrl }) {
  if (!results?.length) return null

  async function handleDownload(imageUrl, index) {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sketch2real-variation-${index + 1}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {results.map((result, i) => (
        <div key={result.id} className="card group overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-surface">
            <img
              src={result.imageUrl}
              alt={`Variation ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute left-2.5 top-2.5 rounded bg-canvas/85 px-2 py-1 font-mono text-[11px] text-graphite backdrop-blur">
              Variation {i + 1}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-3">
            <span className="font-mono text-xs text-graphite">high-res PNG</span>
            <button
              onClick={() => handleDownload(result.imageUrl, i)}
              className="rounded-md border border-panelBorder px-3 py-1.5 font-display text-xs text-chalk transition-colors hover:border-marker hover:text-marker"
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
