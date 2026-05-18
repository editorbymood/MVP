import { useState, useEffect, useRef } from 'react'

const EXAMPLES = [
  { emoji: '🧠', text: 'AI-powered resume builder that tailors resumes to specific job postings in seconds' },
  { emoji: '🏠', text: 'Marketplace connecting homeowners with vetted local handymen for small repairs under $200' },
  { emoji: '📧', text: 'Chrome extension that summarizes long email threads and drafts context-aware replies using AI' },
  { emoji: '💰', text: 'Mobile app that gamifies personal finance habits for Gen Z with social challenges and streaks' },
]

const PLATFORM_OPTIONS = ['Web App', 'Mobile App', 'SaaS', 'AI Tool', 'Browser Extension', 'Desktop App', 'API / Backend Service']
const BUDGET_OPTIONS = ['Bootstrap ($0–$5K)', 'Lean ($5K–$20K)', 'Moderate ($20K–$50K)', 'Well-funded ($50K+)']
const TIMELINE_OPTIONS = ['2–4 weeks', '1–2 months', '2–3 months', '3–6 months']

export default function InputView({ onGenerate, error, initialIdea }) {
  const [idea, setIdea] = useState(initialIdea || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [fields, setFields] = useState({
    targetUsers: '',
    problemStatement: '',
    monetization: '',
    competitors: '',
    platform: '',
    techStack: '',
    budget: '',
    timeline: '',
    teamType: 'solo',
  })
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && idea.trim().length >= 5) {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idea, fields])

  const updateField = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const payload = { idea: idea.trim() }
    // Only include filled optional fields
    if (fields.targetUsers.trim()) payload.targetUsers = fields.targetUsers.trim()
    if (fields.problemStatement.trim()) payload.problemStatement = fields.problemStatement.trim()
    if (fields.monetization.trim()) payload.monetization = fields.monetization.trim()
    if (fields.competitors.trim()) payload.competitors = fields.competitors.trim()
    if (fields.platform) payload.platform = fields.platform
    if (fields.techStack.trim()) payload.techStack = fields.techStack.trim()
    if (fields.budget) payload.budget = fields.budget
    if (fields.timeline) payload.timeline = fields.timeline
    payload.teamType = fields.teamType
    onGenerate(payload)
  }

  return (
    <div className="input-view">
      <div className="input-container">
        <div className="input-header">
          <div className="input-badge">⚡ AI-Powered</div>
          <h1 className="input-title">From Idea to <span className="title-accent">MVP Spec</span></h1>
          <p className="input-subtitle">
            Describe your startup idea and get a complete, ship-ready MVP specification in seconds.
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

        {/* Advanced Fields Toggle */}
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
        >
          <span className="advanced-toggle-icon">{showAdvanced ? '−' : '+'}</span>
          {showAdvanced ? 'Hide details' : 'Add more details for a better spec'}
        </button>

        {showAdvanced && (
          <div className="advanced-fields">
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Target Users</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. Freelance designers, small business owners"
                  value={fields.targetUsers}
                  onChange={(e) => updateField('targetUsers', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Problem Statement</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. Designers waste 3+ hours/week on invoicing"
                  value={fields.problemStatement}
                  onChange={(e) => updateField('problemStatement', e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Monetization Idea</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. Freemium with $9/mo Pro plan"
                  value={fields.monetization}
                  onChange={(e) => updateField('monetization', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Known Competitors</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. Notion, Coda, Slite"
                  value={fields.competitors}
                  onChange={(e) => updateField('competitors', e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Platform Type</label>
                <div className="pill-group">
                  {PLATFORM_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`pill ${fields.platform === opt ? 'active' : ''}`}
                      onClick={() => updateField('platform', fields.platform === opt ? '' : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Preferred Tech Stack</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. React + Node.js, or leave blank for AI recommendation"
                  value={fields.techStack}
                  onChange={(e) => updateField('techStack', e.target.value)}
                />
              </div>
            </div>

            <div className="field-row field-row-three">
              <div className="field-group">
                <label className="field-label">Budget</label>
                <div className="pill-group">
                  {BUDGET_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`pill ${fields.budget === opt ? 'active' : ''}`}
                      onClick={() => updateField('budget', fields.budget === opt ? '' : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Timeline</label>
                <div className="pill-group">
                  {TIMELINE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`pill ${fields.timeline === opt ? 'active' : ''}`}
                      onClick={() => updateField('timeline', fields.timeline === opt ? '' : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Team</label>
                <div className="pill-group">
                  {['Solo Founder', 'Small Team (2–4)', 'Team (5+)'].map(opt => {
                    const val = opt.toLowerCase().includes('solo') ? 'solo' : opt.toLowerCase().includes('small') ? 'small' : 'team'
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`pill ${fields.teamType === val ? 'active' : ''}`}
                        onClick={() => updateField('teamType', val)}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

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
          onClick={handleSubmit}
        >
          Generate MVP Spec
          <span className="shortcut">⌘ Enter</span>
        </button>
      </div>
    </div>
  )
}
