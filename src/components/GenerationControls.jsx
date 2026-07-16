const STYLES = [
  { id: 'photoreal', label: 'Photoreal' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'product', label: 'Product shot' },
  { id: 'concept', label: 'Concept art' },
]

const PALETTES = [
  { id: 'natural', label: 'Natural', swatch: '#8B7355' },
  { id: 'warm', label: 'Warm', swatch: '#E8542A' },
  { id: 'cool', label: 'Cool', swatch: '#4A6B5A' },
  { id: 'mono', label: 'Monochrome', swatch: '#8B8790' },
]

const QUALITIES = [
  { id: 'draft', label: 'Draft', hint: 'fast' },
  { id: 'standard', label: 'Standard', hint: 'balanced' },
  { id: 'high', label: 'High-res', hint: 'slower' },
]

function SegmentGroup({ label, options, value, onChange, renderOption }) {
  return (
    <div>
      <span className="font-mono text-xs text-graphite">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
              value === opt.id
                ? 'border-marker bg-marker/10 text-chalk'
                : 'border-panelBorder bg-surface text-graphite hover:border-graphite hover:text-chalk'
            }`}
          >
            {renderOption ? renderOption(opt) : opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GenerationControls({ style, setStyle, colorPalette, setColorPalette, quality, setQuality, variations, setVariations }) {
  return (
    <div className="flex flex-col gap-6">
      <SegmentGroup label="Style" options={STYLES} value={style} onChange={setStyle} />

      <SegmentGroup
        label="Color palette"
        options={PALETTES}
        value={colorPalette}
        onChange={setColorPalette}
        renderOption={(opt) => (
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: opt.swatch }} />
            {opt.label}
          </span>
        )}
      />

      <SegmentGroup
        label="Quality"
        options={QUALITIES}
        value={quality}
        onChange={setQuality}
        renderOption={(opt) => (
          <span>
            {opt.label} <span className="text-graphite">· {opt.hint}</span>
          </span>
        )}
      />

      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-graphite">Variations</span>
          <span className="font-mono text-xs text-chalk">{variations}</span>
        </div>
        <input
          type="range"
          min={1}
          max={4}
          value={variations}
          onChange={(e) => setVariations(Number(e.target.value))}
          className="mt-2 w-full accent-marker"
        />
      </div>
    </div>
  )
}
