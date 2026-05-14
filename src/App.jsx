import { useState, useCallback } from 'react'
import InputView from './components/InputView'
import LoadingView from './components/LoadingView'
import SpecViewer from './components/SpecViewer'

export default function App() {
  const [view, setView] = useState('input') // 'input' | 'loading' | 'result'
  const [spec, setSpec] = useState(null)
  const [error, setError] = useState(null)
  const [idea, setIdea] = useState('')

  const handleGenerate = useCallback(async (ideaText) => {
    setError(null)
    setView('loading')
    setIdea(ideaText)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaText }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`)
      }

      setSpec(data.spec)
      setView('result')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setView('input')
    }
  }, [])

  const handleReset = useCallback(() => {
    setSpec(null)
    setError(null)
    setIdea('')
    setView('input')
  }, [])

  return (
    <>
      {view === 'input' && (
        <InputView
          onGenerate={handleGenerate}
          error={error}
          initialIdea={idea}
        />
      )}
      {view === 'loading' && <LoadingView />}
      {view === 'result' && spec && (
        <SpecViewer spec={spec} onReset={handleReset} />
      )}
    </>
  )
}
