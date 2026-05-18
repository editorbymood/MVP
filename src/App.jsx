import { useState, useCallback } from 'react'
import InputView from './components/InputView'
import LoadingView from './components/LoadingView'
import SpecViewer from './components/SpecViewer'

export default function App() {
  const [view, setView] = useState('input') // 'input' | 'loading' | 'result'
  const [spec, setSpec] = useState(null)
  const [error, setError] = useState(null)
  const [lastPayload, setLastPayload] = useState(null)

  const handleGenerate = useCallback(async (payload) => {
    setError(null)
    setView('loading')
    setLastPayload(payload)

    // 120s timeout — Gemini thinking can take up to 60s
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      // Read as text first — Cloudflare may return HTML error pages or empty bodies
      const rawText = await res.text()

      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Server returned an empty response. The request may have timed out — please try again.')
      }

      // Check if Cloudflare returned an HTML error page instead of JSON
      if (rawText.trim().startsWith('<') || rawText.trim().startsWith('<!')) {
        throw new Error('The server timed out while generating your spec. This usually means the AI is taking too long. Please try again with a shorter or simpler idea description.')
      }

      let data
      try {
        data = JSON.parse(rawText)
      } catch {
        throw new Error('Server returned an invalid response. Please try again.')
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`)
      }

      setSpec(data.spec)
      setView('result')
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The AI took too long to respond. Please try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
      setView('input')
    } finally {
      clearTimeout(timeout)
    }
  }, [])

  const handleReset = useCallback(() => {
    setSpec(null)
    setError(null)
    setLastPayload(null)
    setView('input')
  }, [])

  return (
    <>
      {view === 'input' && (
        <InputView
          onGenerate={handleGenerate}
          error={error}
          initialIdea={lastPayload?.idea || ''}
        />
      )}
      {view === 'loading' && <LoadingView />}
      {view === 'result' && spec && (
        <SpecViewer spec={spec} onReset={handleReset} />
      )}
    </>
  )
}
