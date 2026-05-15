import { useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

const CHART_COLORS = {
  must: '#ef4444', should: '#f59e0b', could: '#3b82f6',
  high: '#ef4444', medium: '#f59e0b', low: '#22c55e',
  frontend: '#3b82f6', backend: '#22c55e', database: '#f59e0b',
  infrastructure: '#ef4444', ai: '#a855f7',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 14px', fontSize:13, color:'#f1f5f9' }}>
      <span style={{ fontWeight:600 }}>{payload[0].name}</span>: {payload[0].value}
    </div>
  )
}

export default function SpecViewer({ spec, onReset }) {
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(spec, null, 2))
      setCopied(true)
      setToast('JSON copied to clipboard!')
      setTimeout(() => { setCopied(false); setToast(null) }, 2500)
    } catch {
      setToast('Failed to copy')
      setTimeout(() => setToast(null), 2500)
    }
  }, [spec])

  // Chart data
  const featureData = [
    { name: 'Must Have', value: spec.coreFeatures?.must?.length || 0 },
    { name: 'Should Have', value: spec.coreFeatures?.should?.length || 0 },
    { name: 'Could Have', value: spec.coreFeatures?.could?.length || 0 },
  ]

  const riskData = [
    { name: 'High', value: (spec.risks || []).filter(r => r.severity === 'high').length },
    { name: 'Medium', value: (spec.risks || []).filter(r => r.severity === 'medium').length },
    { name: 'Low', value: (spec.risks || []).filter(r => r.severity === 'low').length },
  ].filter(d => d.value > 0)

  const timelineData = (spec.mvpTimeline || []).map(p => {
    const match = p.weeks?.match(/(\d+)(?:\s*-\s*(\d+))?/)
    const start = match ? parseInt(match[1]) : 0
    const end = match ? parseInt(match[2] || match[1]) : start
    return { name: p.phase, weeks: end - start + 1 }
  })

  const costDevData = (spec.costEstimate?.development || []).map(d => ({
    name: d.item?.replace(/\(.*?\)/g, '').trim().substring(0, 25),
    fullName: d.item,
    hours: parseInt(d.hours) || 0,
  }))

  const severityOrder = { high: 0, medium: 1, low: 2 }
  const sortedRisks = [...(spec.risks || [])].sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  )

  return (
    <div className="spec-page">
      {/* Sticky Header */}
      <header className="spec-header">
        <div className="spec-header-left">
          <span className="spec-header-name">{spec.projectName || 'Untitled'}</span>
          <span className="spec-header-tagline">{spec.tagline || ''}</span>
        </div>
        <div className="spec-header-actions">
          <button className={`header-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied' : '⎘ Copy JSON'}
          </button>
          <button className="header-btn header-btn-new" onClick={onReset}>+ New Idea</button>
        </div>
      </header>

      <div className="spec-scroll">
        {/* ── Hero ── */}
        <section className="spec-hero">
          <h1 className="hero-name">{spec.projectName}</h1>
          <p className="hero-tagline">{spec.tagline}</p>
        </section>

        {/* ── Problem & Monetization ── */}
        <section className="spec-section">
          <div className="section-number">01</div>
          <h2 className="section-title">Problem & Business Model</h2>
          <div className="two-col">
            <div className="card">
              <div className="card-label">Problem Statement</div>
              <p className="card-text">{spec.problemStatement}</p>
            </div>
            <div className="card">
              <div className="card-label">Monetization Strategy</div>
              <p className="card-text">{spec.monetization}</p>
            </div>
          </div>
        </section>

        {/* ── Target Users ── */}
        <section className="spec-section">
          <div className="section-number">02</div>
          <h2 className="section-title">Target Users</h2>
          <div className="persona-grid">
            {spec.targetUsers?.map((user, i) => (
              <div key={i} className="card persona-card">
                <div className="persona-name">{user.persona}</div>
                <p className="persona-desc">{user.description}</p>
                <div className="pain-chips">
                  {user.painPoints?.map((pp, j) => (
                    <span key={j} className="pain-chip">{pp}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features with Pie Chart ── */}
        <section className="spec-section">
          <div className="section-number">03</div>
          <h2 className="section-title">Core Features</h2>
          <div className="features-layout">
            <div className="chart-card">
              <div className="card-label">Feature Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={featureData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {featureData.map((_, i) => (
                      <Cell key={i} fill={[CHART_COLORS.must, CHART_COLORS.should, CHART_COLORS.could][i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="moscow-columns">
              {[
                { items: spec.coreFeatures?.must || [], label: 'Must Have', cls: 'must' },
                { items: spec.coreFeatures?.should || [], label: 'Should Have', cls: 'should' },
                { items: spec.coreFeatures?.could || [], label: 'Could Have', cls: 'could' },
              ].map(({ items, label, cls }) => (
                <div key={cls} className="moscow-column">
                  <div className={`moscow-header ${cls}`}>{label} ({items.length})</div>
                  {items.map((f, i) => (
                    <div key={i} className="card feature-card">
                      <div className="feature-name">{f.feature}</div>
                      <div className="feature-rationale">{f.rationale}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="spec-section">
          <div className="section-number">04</div>
          <h2 className="section-title">Tech Stack</h2>
          <div className="tech-categories">
            {[
              { key: 'frontend', label: 'Frontend', icon: '🎨' },
              { key: 'backend', label: 'Backend', icon: '⚙️' },
              { key: 'database', label: 'Database', icon: '🗄️' },
              { key: 'infrastructure', label: 'Infrastructure', icon: '☁️' },
              { key: 'ai', label: 'AI / ML', icon: '🤖' },
            ].map(({ key, label, icon }) => {
              const items = spec.techStack?.[key]
              if (!items?.length) return null
              return (
                <div key={key} className="tech-category-block">
                  <div className="tech-category-header">
                    <span className={`tech-dot ${key}`} />
                    <span className="tech-category-title">{icon} {label}</span>
                  </div>
                  <div className="tech-items-grid">
                    {items.map((t, i) => {
                      // Handle both object {name, reason, usage} and legacy string format
                      const isObj = typeof t === 'object' && t !== null
                      const name = isObj ? t.name : t
                      const reason = isObj ? t.reason : null
                      const usage = isObj ? t.usage : null
                      return (
                        <div key={i} className={`card tech-detail-card ${key}`}>
                          <div className="tech-detail-name">{name}</div>
                          {reason && (
                            <div className="tech-detail-row">
                              <span className="tech-detail-label">Why</span>
                              <span className="tech-detail-text">{reason}</span>
                            </div>
                          )}
                          {usage && (
                            <div className="tech-detail-row">
                              <span className="tech-detail-label">How</span>
                              <span className="tech-detail-text">{usage}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── User Stories ── */}
        <section className="spec-section">
          <div className="section-number">05</div>
          <h2 className="section-title">User Stories</h2>
          <div className="stories-list">
            {spec.userStories?.map((story, i) => {
              const parts = story.match(/^(As an?\s+.+?),?\s+(I want to\s+.+?)\s+(so that\s+.+)$/i)
              return (
                <div key={i} className="card story-card">
                  <span className="story-id">US-{String(i + 1).padStart(2, '0')}</span>
                  <div className="story-text">
                    {parts ? (<><strong>{parts[1]}</strong>, {parts[2]} {parts[3]}</>) : story}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Timeline with Chart ── */}
        <section className="spec-section">
          <div className="section-number">06</div>
          <h2 className="section-title">Development Timeline</h2>
          {timelineData.length > 0 && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <div className="card-label">Weeks Per Phase</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timelineData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fill:'#94a3b8', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill:'#f1f5f9', fontSize:12 }} width={160} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="weeks" fill="#7c3aed" radius={[0, 6, 6, 0]} barSize={20} name="Weeks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="timeline">
            {spec.mvpTimeline?.map((phase, i) => (
              <div key={i} className="timeline-phase">
                <div className="timeline-dot"><div className="timeline-dot-inner" /></div>
                <div className="phase-header">
                  <span className="phase-name">{phase.phase}</span>
                  <span className="phase-weeks">{phase.weeks}</span>
                </div>
                <ul className="phase-tasks">
                  {phase.tasks?.map((task, j) => (
                    <li key={j} className="phase-task">{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Costing ── */}
        <section className="spec-section">
          <div className="section-number">07</div>
          <h2 className="section-title">Cost Estimate</h2>
          <div className="cost-summary-row">
            <div className="card cost-total-card">
              <div className="card-label">💰 Total MVP Budget</div>
              <div className="cost-big-number">{spec.costEstimate?.totalMvpBudget || 'N/A'}</div>
              <div className="cost-sub">One-time development cost</div>
            </div>
            <div className="card cost-total-card">
              <div className="card-label">🔄 Monthly Run Rate</div>
              <div className="cost-big-number monthly">{spec.costEstimate?.monthlyRunRate || 'N/A'}</div>
              <div className="cost-sub">Recurring operational cost</div>
            </div>
          </div>
          {spec.costEstimate?.costNotes && (
            <div className="card cost-notes-card" style={{ marginTop: 12 }}>
              <div className="card-label">📋 Pricing Assumptions</div>
              <p className="card-text cost-notes-text">{spec.costEstimate.costNotes}</p>
            </div>
          )}
          <div className="two-col" style={{ marginTop: 16 }}>
            {spec.costEstimate?.development?.length > 0 && (
              <div className="card">
                <div className="card-label">Development Breakdown</div>
                {costDevData.length > 0 && (
                  <ResponsiveContainer width="100%" height={Math.max(150, costDevData.length * 36)}>
                    <BarChart data={costDevData} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill:'#f1f5f9', fontSize:11 }} width={140} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="hours" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={16} name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <table className="cost-table">
                  <thead><tr><th>Item</th><th>Hours</th><th>Rate</th><th>Cost</th></tr></thead>
                  <tbody>
                    {spec.costEstimate.development.map((d, i) => (
                      <tr key={i}>
                        <td>{d.item}</td>
                        <td className="cost-hours">{d.hours}</td>
                        <td className="cost-rate">{d.rate || '—'}</td>
                        <td className="cost-amount">{d.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {spec.costEstimate?.monthly?.length > 0 && (
              <div className="card">
                <div className="card-label">Monthly Infrastructure</div>
                <table className="cost-table">
                  <thead><tr><th>Service</th><th>Cost</th><th>Free Tier</th><th>Notes</th></tr></thead>
                  <tbody>
                    {spec.costEstimate.monthly.map((m, i) => (
                      <tr key={i}>
                        <td>{m.item}</td>
                        <td className="cost-amount">{m.cost}</td>
                        <td className="cost-free-tier">{m.freeTier || '—'}</td>
                        <td className="cost-notes">{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Competitors ── */}
        {spec.competitiveLandscape && (
          <section className="spec-section">
            <div className="section-number">08</div>
            <h2 className="section-title">Competitive Landscape</h2>
            {spec.competitiveLandscape.differentiator && (
              <div className="card differentiator-card">
                <div className="card-label">Your Differentiator</div>
                <p className="card-text differentiator-text">{spec.competitiveLandscape.differentiator}</p>
              </div>
            )}
            <div className="competitors-grid">
              {spec.competitiveLandscape.competitors?.map((c, i) => (
                <div key={i} className="card competitor-card">
                  <div className="competitor-name">{c.name}</div>
                  <div className="competitor-row"><span className="comp-label strength">✓ Strength</span><span>{c.strength}</span></div>
                  <div className="competitor-row"><span className="comp-label weakness">✗ Weakness</span><span>{c.weakness}</span></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Metrics ── */}
        <section className="spec-section">
          <div className="section-number">09</div>
          <h2 className="section-title">Success Metrics</h2>
          <div className="metrics-grid">
            {spec.successMetrics?.map((m, i) => (
              <div key={i} className="card metric-card">
                <div className="metric-value">{m.target}</div>
                <div className="metric-name">{m.metric}</div>
                <div className="metric-timeframe">{m.timeframe}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Risks with Chart ── */}
        <section className="spec-section">
          <div className="section-number">10</div>
          <h2 className="section-title">Risk Assessment</h2>
          <div className="risks-layout">
            {riskData.length > 0 && (
              <div className="chart-card chart-card-sm">
                <div className="card-label">Severity Distribution</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {riskData.map((d) => (
                        <Cell key={d.name} fill={CHART_COLORS[d.name.toLowerCase()]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="risks-list-wrap">
              {sortedRisks.map((r, i) => (
                <div key={i} className="card risk-card">
                  <span className={`severity-badge ${r.severity}`}>{r.severity}</span>
                  <div className="risk-content">
                    <div className="risk-title">{r.risk}</div>
                    <div className="risk-mitigation"><span className="risk-mitigation-label">Mitigation: </span>{r.mitigation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Future Scope ── */}
        {spec.futureScope && (
          <section className="spec-section">
            <div className="section-number">11</div>
            <h2 className="section-title">Future Scope</h2>
            {spec.futureScope.longTermVision && (
              <div className="card">
                <div className="card-label">Long-Term Vision (12-18 months)</div>
                <p className="card-text">{spec.futureScope.longTermVision}</p>
              </div>
            )}
            {spec.futureScope.v2Features?.length > 0 && (
              <div className="card">
                <div className="card-label">V2 Feature Roadmap</div>
                <div className="v2-features-list">
                  {spec.futureScope.v2Features.map((f, i) => (
                    <div key={i} className="v2-feature-item">
                      <div className="v2-feature-header">
                        <span className="v2-feature-name">{f.feature}</span>
                        <span className="v2-effort-badge">{f.estimatedEffort}</span>
                      </div>
                      <div className="v2-feature-rationale">{f.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {spec.futureScope.scalingConsiderations?.length > 0 && (
              <div className="card">
                <div className="card-label">Scaling Considerations</div>
                <ul className="scaling-list">
                  {spec.futureScope.scalingConsiderations.map((s, i) => (
                    <li key={i} className="scaling-item">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ── Next Steps ── */}
        <section className="spec-section">
          <div className="section-number">12</div>
          <h2 className="section-title">Next Steps — First 7 Days</h2>
          <div className="card">
            <ul className="next-steps-list">
              {spec.nextSteps?.map((step, i) => (
                <li key={i} className="next-step-item">
                  <span className="step-number">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="spec-footer">
          <p>Generated by <strong>SpecForge</strong> — AI-Powered MVP Spec Generator</p>
        </footer>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
