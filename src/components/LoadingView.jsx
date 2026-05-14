import { useState, useEffect } from 'react'

const STEPS = [
  { label: 'Analyzing your idea', duration: 2500 },
  { label: 'Researching target market', duration: 3000 },
  { label: 'Crafting user personas', duration: 2800 },
  { label: 'Defining core features', duration: 3200 },
  { label: 'Selecting tech stack', duration: 2500 },
  { label: 'Building development timeline', duration: 3000 },
  { label: 'Estimating costs & budget', duration: 2800 },
  { label: 'Analyzing competitors', duration: 3000 },
  { label: 'Calculating success metrics', duration: 2500 },
  { label: 'Assessing risks', duration: 2800 },
  { label: 'Planning future roadmap', duration: 3000 },
  { label: 'Finalizing specification', duration: 4000 },
]

export default function LoadingView() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    let timeout
    const advance = () => {
      setActiveStep((prev) => {
        const next = prev + 1
        if (next < STEPS.length) {
          timeout = setTimeout(advance, STEPS[next].duration)
        }
        return Math.min(next, STEPS.length - 1)
      })
    }
    timeout = setTimeout(advance, STEPS[0].duration)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="loading-view">
      <div className="loading-container">
        <div className="loading-header">
          <div className="spinner-ring" />
          <h2 className="loading-title">Generating your MVP Spec</h2>
          <p className="loading-subtitle">This usually takes 15-30 seconds</p>
        </div>
        <div className="loading-steps">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`loading-step ${
                i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending'
              }`}
            >
              <div className="step-indicator">
                {i < activeStep ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i === activeStep ? (
                  <div className="step-spinner" />
                ) : (
                  <div className="step-dot" />
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
