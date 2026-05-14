import { useState, useEffect, useRef } from 'react'

const EXAMPLES = [
  { emoji: '🧠', text: 'AI-powered resume builder that tailors resumes to specific job postings in seconds' },
  { emoji: '🏠', text: 'Marketplace connecting homeowners with vetted local handymen for small repairs under $200' },
  { emoji: '📧', text: 'Chrome extension that summarizes long email threads and drafts context-aware replies using AI' },
  { emoji: '💰', text: 'Mobile app that gamifies personal finance habits for Gen Z with social challenges and streaks' },
]

export default function InputView({ onGenerate, error, initialIdea }) {
  const [idea, setIdea] = useState(initialIdea || '')
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && idea.trim().length >= 5) {
        e.preventDefault()
        onGenerate(idea.trim())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idea, onGenerate])

  return (
    <div className="input-view">
      <div className="input-container">
        <div className="input-header">
          <div className="input-badge">⚡ AI-Powered</div>
          <h1 className="input-title">Idea → MVP Spec</h1>
          <p className="input-subtitle">
            Drop your startup idea below. Get a complete, ship-ready MVP specification in seconds.
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="idea-textarea-wrap">
          <textarea
            ref={textareaRef}
            className="idea-textarea"
            placeholder="Describe your startup idea here... Be as specific as you can — who it's for, what it does, what makes it different."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            maxLength={2000}
          />
          <span className="char-count">{idea.length}/2000</span>
        </div>

        <div className="examples-label">Try an example</div>
        <div className="examples-grid">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              className="example-chip"
              onClick={() => setIdea(ex.text)}
            >
              <span className="example-emoji">{ex.emoji}</span>
              {ex.text}
            </button>
          ))}
        </div>

        <button
          className="generate-btn"
          disabled={idea.trim().length < 5}
          onClick={() => onGenerate(idea.trim())}
        >
          Generate MVP Spec
          <span className="shortcut">⌘ Enter</span>
        </button>
      </div>
    </div>
  )
}
