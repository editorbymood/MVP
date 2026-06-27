import { useState, useEffect, useRef } from 'react'
import ScrollBlurEssential from './ScrollBlurEssential'

const EXAMPLES = [
  { emoji: '🧠', text: 'AI-powered resume builder that tailors resumes to specific job postings in seconds' },
  { emoji: '🏠', text: 'Marketplace connecting homeowners with vetted local handymen for small repairs under $200' },
  { emoji: '📧', text: 'Chrome extension that summarizes long email threads and drafts context-aware replies using AI' },
  { emoji: '💰', text: 'Mobile app that gamifies personal finance habits for Gen Z with social challenges and streaks' },
]

const PLATFORM_OPTIONS = ['Web App', 'Mobile App', 'SaaS', 'AI Tool', 'Browser Extension', 'Desktop App', 'API / Backend Service']
const BUDGET_OPTIONS = ['Bootstrap ($0–$5K)', 'Lean ($5K–$20K)', 'Moderate ($20K–$50K)', 'Well-funded ($50K+)']
const TIMELINE_OPTIONS = ['2–4 weeks', '1–2 months', '2–3 months', '3–6 months']

const Features = () => (
  <div className="landing-section features-section">
    <h2 className="section-heading">Everything you need to plan your MVP</h2>
    <div className="features-grid">
      <div className="feature-item">
        <span className="feature-icon">🎯</span>
        <h3>Target Market & Personas</h3>
        <p>AI-generated user personas with pain points, motivations, and tailored solutions.</p>
      </div>
      <div className="feature-item">
        <span className="feature-icon">⚡</span>
        <h3>Tech Stack Recommendations</h3>
        <p>Optimal frontend, backend, and infrastructure choices based on your budget and timeline.</p>
      </div>
      <div className="feature-item">
        <span className="feature-icon">💰</span>
        <h3>Cost & Timeline Estimates</h3>
        <p>Realistic breakdown of development phases, hours, and estimated costs.</p>
      </div>
      <div className="feature-item">
        <span className="feature-icon">🚀</span>
        <h3>Future Roadmap (v2.0)</h3>
        <p>A strategic path for scaling your MVP with advanced features and integrations.</p>
      </div>
    </div>
  </div>
);

const AdvancedModels = () => (
  <div className="landing-section advanced-section">
    <div className="advanced-badge">Powered by advanced AI</div>
    <h2 className="section-heading">Built on Gemini 2.5 Flash</h2>
    <p className="section-sub">
      We leverage state-of-the-art language models with immense context windows and lightning-fast inference to generate comprehensive technical specs in seconds. Future updates will introduce reasoning models and multimodal inputs.
    </p>
  </div>
);

const Footer = () => (
  <footer className="landing-footer">
    <div className="footer-content">
      <div className="footer-logo">⚡ Ideate to MVP</div>
      <div className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
      <div className="footer-socials">
        <a href="#" aria-label="Twitter">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a href="#" aria-label="GitHub">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
        <a href="#" aria-label="LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </div>
  </footer>
);

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
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef(null)
  const textareaRef = useRef(null)

  const handleScroll = () => {
    setIsScrolling(true)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 180)
  }

  useEffect(() => {
    textareaRef.current?.focus()
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
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
    <div className="input-view" onScroll={handleScroll}>
      <div className="scroll-blur-container">
        <ScrollBlurEssential direction="top" />
      </div>

      <div className="input-container">
        <div className="input-header">
          <div className="input-badge">⚡ AI-Powered</div>
          <h1 className="input-title">From Idea to <span className="title-accent">MVP Spec</span></h1>
          <p className="input-subtitle">
            Describe your startup idea and get a complete, ship-ready MVP specification in seconds.
          </p>
          <div className="hero-tip-notice">
            <span className="tip-emoji">💡</span>
            <div className="tip-text">
              <strong>Tips for best results:</strong> Keep your idea under 2–3 sentences · Focus on the core problem · Avoid technical jargon · One product idea at a time
            </div>
          </div>
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

      <Features />
      <AdvancedModels />
      <Footer />
    </div>
  )
}
