import { useState } from 'react'
import { generationApi } from '../api'
import SketchDropzone from '../components/SketchDropzone'
import DrawingCanvas from '../components/DrawingCanvas'
import GenerationControls from '../components/GenerationControls'
import ResultsGrid from '../components/ResultsGrid'

export default function StudioPage() {
  const [mode, setMode] = useState('draw') // 'draw' | 'upload'
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [style, setStyle] = useState('photoreal')
  const [colorPalette, setColorPalette] = useState('natural')
  const [quality, setQuality] = useState('standard')
  const [variations, setVariations] = useState(2)

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [generation, setGeneration] = useState(null)

  function handleFileSelect(selectedFile) {
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setGeneration(null)
    setError(null)
  }

  function handleDrawingExport(blob) {
    const drawnFile = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' })
    setFile(drawnFile)
    setPreviewUrl(URL.createObjectURL(drawnFile))
    setGeneration(null)
    setError(null)
  }

  async function handleGenerate() {
    if (!file) {
      setError(mode === 'draw' ? 'Finish your drawing and click "Use this drawing" first.' : 'Upload a sketch first.')
      return
    }
    setError(null)
    setIsGenerating(true)
    setGeneration(null)
    try {
      const { generation } = await generationApi.create({ file, style, colorPalette, quality, variations })
      setGeneration(generation)
    } catch (err) {
      setError(err.message || 'Generation failed. Try again in a moment.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase tracking-wider text-marker">Studio</span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-chalk">Turn a sketch into a render</h1>
        <p className="mt-2 max-w-xl text-graphite">
          Draw directly on the canvas or upload line art, pick a direction, and generate photoreal variations while
          keeping the original composition.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="mb-6 inline-flex rounded-lg border border-panelBorder bg-panel p-1">
        <button
          onClick={() => setMode('draw')}
          className={`rounded-md px-4 py-2 font-display text-sm transition-colors ${
            mode === 'draw' ? 'bg-marker text-chalk' : 'text-graphite hover:text-chalk'
          }`}
        >
          Draw
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`rounded-md px-4 py-2 font-display text-sm transition-colors ${
            mode === 'upload' ? 'bg-marker text-chalk' : 'text-graphite hover:text-chalk'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Canvas / upload area */}
      <div className="mb-8">
        {mode === 'draw' ? (
          <DrawingCanvas onExport={handleDrawingExport} />
        ) : (
          <div className="max-w-xl">
            <SketchDropzone file={file} previewUrl={previewUrl} onFileSelect={handleFileSelect} />
          </div>
        )}
      </div>

      {file && (
        <div className="mb-8 flex items-center gap-2 rounded-md border border-sage/40 bg-sage/10 px-3.5 py-2.5 text-sm text-sageBright">
          <span className="h-1.5 w-1.5 rounded-full bg-sageBright" />
          {mode === 'draw' ? 'Drawing ready' : `"${file.name}" ready`} — set your generation options below.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Controls */}
        <div className="card p-6">
          <h2 className="font-display text-sm font-medium text-chalk">Generation settings</h2>
          <div className="mt-5">
            <GenerationControls
              style={style}
              setStyle={setStyle}
              colorPalette={colorPalette}
              setColorPalette={setColorPalette}
              quality={quality}
              setQuality={setQuality}
              variations={variations}
              setVariations={setVariations}
            />
          </div>
        </div>

        {/* Generate action */}
        <div className="card flex flex-col justify-center gap-4 p-6">
          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}
          {previewUrl && (
            <img src={previewUrl} alt="Current sketch" className="max-h-40 w-full rounded-md border border-panelBorder object-contain bg-surface" />
          )}
          <button onClick={handleGenerate} disabled={isGenerating || !file} className="btn-primary w-full">
            {isGenerating ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-chalk/30 border-t-chalk" />
                Rendering your sketch…
              </>
            ) : (
              'Generate realistic image'
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {generation && (
        <div className="mt-12 border-t border-panelBorder/60 pt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-chalk">Your results</h2>
            <span className="font-mono text-xs text-graphite">
              {generation.results.length} variation{generation.results.length !== 1 ? 's' : ''} · {style} · {colorPalette}
            </span>
          </div>
          <ResultsGrid results={generation.results} sketchUrl={generation.sketchUrl} />
        </div>
      )}
    </main>
  )
}
