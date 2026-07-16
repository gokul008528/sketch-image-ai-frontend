import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Multi-layer drawing canvas: pen, eraser, shapes (line/rect/circle), fill
 * bucket, undo/redo per layer stack, zoom, and a flattened PNG export via
 * handleExport(), passed up through the onExport callback.
 *
 * Layers are represented as an array of offscreen canvases composited in
 * order onto one visible <canvas>. Only the active layer is drawn on;
 * others are just for compositing.
 */

const TOOLS = [
  { id: 'pen', label: 'Pen', icon: 'M4 20l1-5L16 4l4 4L9 19l-5 1Z' },
  { id: 'eraser', label: 'Eraser', icon: 'M3 17l7-7 7 7-3 3H8l-5-3Zm7-7 6-6 5 5-6 6' },
  { id: 'line', label: 'Line', icon: 'M4 20L20 4' },
  { id: 'rect', label: 'Rectangle', icon: 'M4 5h16v14H4z' },
  { id: 'circle', label: 'Circle', icon: '' }, // rendered separately
  { id: 'fill', label: 'Fill', icon: 'M5 10l7-7 7 7-7 7-7-7Zm2 9h13' },
]

const SWATCHES = ['#F5F2EA', '#0E0D10', '#E8542A', '#4A6B5A', '#3E7CB1', '#C9A227', '#8B8790']

function createLayerCanvas(width, height) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  return c
}

function hexToRgba(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return [r, g, b, 255]
}

// Flood fill on a single layer's ImageData
function floodFill(ctx, width, height, startX, startY, fillColor) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const startIdx = (startY * width + startX) * 4
  const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]]
  const [fr, fg, fb, fa] = fillColor

  if (startColor[0] === fr && startColor[1] === fg && startColor[2] === fb && startColor[3] === fa) return

  const matches = (idx) =>
    data[idx] === startColor[0] &&
    data[idx + 1] === startColor[1] &&
    data[idx + 2] === startColor[2] &&
    data[idx + 3] === startColor[3]

  const stack = [[startX, startY]]
  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || x >= width || y < 0 || y >= height) continue
    const idx = (y * width + x) * 4
    if (!matches(idx)) continue
    data[idx] = fr
    data[idx + 1] = fg
    data[idx + 2] = fb
    data[idx + 3] = fa
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  ctx.putImageData(imageData, 0, 0)
}

export default function DrawingCanvas({ width = 900, height = 675, onExport }) {
  const containerRef = useRef(null)
  const visibleCanvasRef = useRef(null)
  const layersRef = useRef([createLayerCanvas(width, height)])
  const historyRef = useRef([[]]) // per-layer undo stacks of dataURLs
  const redoRef = useRef([[]])
  const isDrawingRef = useRef(false)
  const startPointRef = useRef(null)
  const snapshotRef = useRef(null) // for shape preview

  const [layers, setLayers] = useState([{ id: 'layer-1', name: 'Layer 1', visible: true }])
  const [activeLayerIndex, setActiveLayerIndex] = useState(0)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#F5F2EA')
  const [brushSize, setBrushSize] = useState(4)
  const [zoom, setZoom] = useState(1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [, forceRender] = useState(0)

  const redrawComposite = useCallback(() => {
    const visible = visibleCanvasRef.current
    if (!visible) return
    const ctx = visible.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#1A181D'
    ctx.fillRect(0, 0, width, height)
    layersRef.current.forEach((layerCanvas, i) => {
      if (layers[i]?.visible === false) return
      ctx.drawImage(layerCanvas, 0, 0)
    })
  }, [layers, width, height])

  useEffect(() => {
    redrawComposite()
  }, [redrawComposite])

  function pushHistory(layerIndex) {
    const layerCanvas = layersRef.current[layerIndex]
    const dataUrl = layerCanvas.toDataURL()
    historyRef.current[layerIndex] = [...historyRef.current[layerIndex], dataUrl]
    redoRef.current[layerIndex] = []
    setCanUndo(true)
    setCanRedo(false)
  }

  function getActiveCtx() {
    return layersRef.current[activeLayerIndex].getContext('2d')
  }

  function getCanvasPoint(e) {
    const canvas = visibleCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = ((clientX - rect.left) / rect.width) * width
    const y = ((clientY - rect.top) / rect.height) * height
    return { x: Math.round(x), y: Math.round(y) }
  }

  function handlePointerDown(e) {
    e.preventDefault()
    const { x, y } = getCanvasPoint(e)
    const ctx = getActiveCtx()

    if (tool === 'fill') {
      const [r, g, b, a] = hexToRgba(color)
      floodFill(ctx, width, height, x, y, [r, g, b, a])
      pushHistory(activeLayerIndex)
      redrawComposite()
      return
    }

    isDrawingRef.current = true
    startPointRef.current = { x, y }

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = brushSize
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = color
    } else {
      // shape tools: snapshot current layer for live preview
      snapshotRef.current = ctx.getImageData(0, 0, width, height)
    }
  }

  function handlePointerMove(e) {
    if (!isDrawingRef.current) return
    e.preventDefault()
    const { x, y } = getCanvasPoint(e)
    const ctx = getActiveCtx()

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
      redrawComposite()
    } else if (['line', 'rect', 'circle'].includes(tool)) {
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.lineWidth = brushSize
      ctx.strokeStyle = color
      ctx.globalCompositeOperation = 'source-over'
      const { x: sx, y: sy } = startPointRef.current
      ctx.beginPath()
      if (tool === 'line') {
        ctx.moveTo(sx, sy)
        ctx.lineTo(x, y)
      } else if (tool === 'rect') {
        ctx.rect(sx, sy, x - sx, y - sy)
      } else if (tool === 'circle') {
        const r = Math.hypot(x - sx, y - sy)
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
      }
      ctx.stroke()
      redrawComposite()
    }
  }

  function handlePointerUp() {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    pushHistory(activeLayerIndex)
  }

  function handleUndo() {
    const stack = historyRef.current[activeLayerIndex]
    if (stack.length === 0) return
    const last = stack[stack.length - 1]
    historyRef.current[activeLayerIndex] = stack.slice(0, -1)
    redoRef.current[activeLayerIndex] = [...redoRef.current[activeLayerIndex], last]

    const ctx = getActiveCtx()
    const prev = historyRef.current[activeLayerIndex][historyRef.current[activeLayerIndex].length - 1]
    ctx.clearRect(0, 0, width, height)
    if (prev) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        redrawComposite()
      }
      img.src = prev
    } else {
      redrawComposite()
    }
    setCanUndo(historyRef.current[activeLayerIndex].length > 0)
    setCanRedo(true)
  }

  function handleRedo() {
    const stack = redoRef.current[activeLayerIndex]
    if (stack.length === 0) return
    const next = stack[stack.length - 1]
    redoRef.current[activeLayerIndex] = stack.slice(0, -1)
    historyRef.current[activeLayerIndex] = [...historyRef.current[activeLayerIndex], next]

    const ctx = getActiveCtx()
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0)
      redrawComposite()
    }
    img.src = next
    setCanRedo(redoRef.current[activeLayerIndex].length > 0)
    setCanUndo(true)
  }

  function handleClearLayer() {
    const ctx = getActiveCtx()
    ctx.clearRect(0, 0, width, height)
    pushHistory(activeLayerIndex)
    redrawComposite()
  }

  function handleAddLayer() {
    layersRef.current = [...layersRef.current, createLayerCanvas(width, height)]
    historyRef.current = [...historyRef.current, []]
    redoRef.current = [...redoRef.current, []]
    const newLayers = [...layers, { id: `layer-${layers.length + 1}`, name: `Layer ${layers.length + 1}`, visible: true }]
    setLayers(newLayers)
    setActiveLayerIndex(newLayers.length - 1)
  }

  function handleDeleteLayer(index) {
    if (layers.length === 1) return
    layersRef.current = layersRef.current.filter((_, i) => i !== index)
    historyRef.current = historyRef.current.filter((_, i) => i !== index)
    redoRef.current = redoRef.current.filter((_, i) => i !== index)
    const newLayers = layers.filter((_, i) => i !== index)
    setLayers(newLayers)
    setActiveLayerIndex((idx) => Math.min(idx, newLayers.length - 1))
    forceRender((n) => n + 1)
  }

  function toggleLayerVisibility(index) {
    const newLayers = layers.map((l, i) => (i === index ? { ...l, visible: !l.visible } : l))
    setLayers(newLayers)
  }

  async function handleExport() {
    // Ensure a fully composited flatten, including bg, for sending to the API
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = width
    exportCanvas.height = height
    const ctx = exportCanvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    layersRef.current.forEach((layerCanvas, i) => {
      if (layers[i]?.visible === false) return
      ctx.drawImage(layerCanvas, 0, 0)
    })
    exportCanvas.toBlob((blob) => {
      if (blob) onExport?.(blob)
    }, 'image/png')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-panelBorder bg-panel p-2.5">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => setTool(t.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
              tool === t.id
                ? 'border-marker bg-marker/15 text-marker'
                : 'border-transparent text-graphite hover:bg-surface hover:text-chalk'
            }`}
          >
            {t.id === 'circle' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d={t.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}

        <div className="mx-1 h-6 w-px bg-panelBorder" />

        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          {SWATCHES.map((sw) => (
            <button
              key={sw}
              type="button"
              onClick={() => setColor(sw)}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${
                color === sw ? 'scale-110 border-marker' : 'border-panelBorder'
              }`}
              style={{ backgroundColor: sw }}
              aria-label={`Color ${sw}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded-full border border-panelBorder bg-transparent"
            aria-label="Custom color"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-panelBorder" />

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-graphite">Size</span>
          <input
            type="range"
            min={1}
            max={40}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-marker"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-panelBorder" />

        {/* Undo/redo/clear */}
        <button onClick={handleUndo} disabled={!canUndo} className="btn-secondary !px-2.5 !py-1.5 text-xs disabled:opacity-30">
          Undo
        </button>
        <button onClick={handleRedo} disabled={!canRedo} className="btn-secondary !px-2.5 !py-1.5 text-xs disabled:opacity-30">
          Redo
        </button>
        <button onClick={handleClearLayer} className="btn-secondary !px-2.5 !py-1.5 text-xs">
          Clear layer
        </button>

        <div className="mx-1 h-6 w-px bg-panelBorder" />

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="btn-secondary !px-2.5 !py-1.5 text-xs">
            −
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-graphite">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="btn-secondary !px-2.5 !py-1.5 text-xs">
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex flex-1 items-center justify-center overflow-auto rounded-lg border border-panelBorder bg-surface p-4"
        >
          <canvas
            ref={visibleCanvasRef}
            width={width}
            height={height}
            style={{ width: width * zoom, height: height * zoom, touchAction: 'none' }}
            className="cursor-crosshair rounded border border-panelBorder/60 bg-white shadow-lg"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>

        {/* Layers panel */}
        <div className="w-full shrink-0 lg:w-52">
          <div className="card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs text-graphite">Layers</span>
              <button onClick={handleAddLayer} className="rounded px-1.5 py-0.5 font-mono text-xs text-marker hover:bg-marker/10">
                + Add
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {layers
                .map((l, i) => ({ ...l, i }))
                .slice()
                .reverse()
                .map(({ i, ...l }) => (
                  <div
                    key={l.id}
                    onClick={() => setActiveLayerIndex(i)}
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-2.5 py-2 transition-colors ${
                      activeLayerIndex === i ? 'border-marker bg-marker/10' : 'border-transparent hover:bg-surface'
                    }`}
                  >
                    <span className="font-mono text-xs text-chalk">{l.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerVisibility(i)
                        }}
                        className="text-graphite hover:text-chalk"
                        title={l.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {l.visible ? '👁' : '—'}
                      </button>
                      {layers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLayer(i)
                          }}
                          className="text-graphite hover:text-danger"
                          title="Delete layer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button onClick={handleExport} className="btn-primary mt-4 w-full">
            Use this drawing
          </button>
        </div>
      </div>
    </div>
  )
}
