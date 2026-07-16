import { useRef, useState, useCallback } from 'react'

export default function SketchDropzone({ file, previewUrl, onFileSelect }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (files) => {
      const f = files?.[0]
      if (!f) return
      if (!f.type.startsWith('image/')) return
      onFileSelect(f)
    },
    [onFileSelect]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className={`relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border-2 border-dashed bg-surface transition-colors ${
        isDragging ? 'border-marker bg-marker/5' : 'border-panelBorder hover:border-graphite'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Sketch preview" className="absolute inset-0 h-full w-full object-contain p-4" />
          <div className="absolute bottom-3 right-3 rounded bg-canvas/85 px-2.5 py-1 font-mono text-[11px] text-graphite backdrop-blur">
            {file?.name}
          </div>
        </>
      ) : (
        <>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-graphite">
            <path
              d="M6 28C8 16, 14 6, 20 6C26 6, 28 12, 34 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 5"
              className="animate-dash"
            />
            <circle cx="34" cy="10" r="2" fill="currentColor" />
          </svg>
          <p className="font-display text-sm font-medium text-chalk">Drop your sketch here</p>
          <p className="font-mono text-xs text-graphite">or click to browse — PNG, JPG, WebP</p>
        </>
      )}
    </div>
  )
}
