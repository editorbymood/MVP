import { useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

const CHART_COLORS = {
  must: '#1A1A1A', should: '#525252', could: '#888888',
  high: '#DC2626', medium: '#D9A057', low: '#37955B',
  frontend: '#4075C9', backend: '#37955B', database: '#D9A057',
  infrastructure: '#DC2626', ai: '#7157D9',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid rgba(0,0,0,0.08)', borderRadius:8, padding:'8px 14px', fontSize:13, color:'var(--text-primary)', boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }}>
      <span style={{ fontWeight:600 }}>{payload[0].name}</span>: {payload[0].value}
    </div>
  )
}

export default function SpecViewer({ spec, onReset }) {
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('product') // 'product' | 'tech' | 'business'

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

      {/* Navigation Tabs */}
      <div className="spec-nav-tabs">
        <button className={`nav-tab-btn ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}>
          📦 Product Spec
        </button>
        <button className={`nav-tab-btn ${activeTab === 'tech' ? 'active' : ''}`} onClick={() => setActiveTab('tech')}>
          ⚙️ Tech Architecture
        </button>
        <button className={`nav-tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>
          💼 Strategy & Cost
        </button>
      </div>

      <div className="spec-scroll">
        {/* ── Tab: Product Spec ── */}
        {activeTab === 'product' && (
          <>
            {/* ── Hero ── */}
            <section className="spec-hero">
              <h1 className="hero-name">{spec.projectName}</h1>
              <p className="hero-tagline">{spec.tagline}</p>
            </section>

            {/* ── Problem & Validation ── */}
            <section className="spec-section">
              <div className="section-number">01</div>
              <h2 className="section-title">Problem & Validation</h2>
              <div className="card">
                <div className="card-label">Problem Statement</div>
                <p className="card-text">{spec.problemStatement}</p>
              </div>

              {spec.problemValidation && (
                <div className="validation-block" style={{ marginTop: 24 }}>
                  <div className="validation-header">
                    <div className="validation-score-badge">
                      <span className="score-val">{spec.problemValidation.overallScore}</span>
                      <span className="score-max">/10</span>
                      <span className="score-label">Viability Score</span>
                    </div>
                    <div className="validation-verdict">
                      <div className="card-label">Strategic Verdict</div>
                      <p className="card-text">{spec.problemValidation.verdict}</p>
                    </div>
                  </div>

                  <div className="validation-grid" style={{ marginTop: 20 }}>
                    {spec.problemValidation.scores?.map((s, idx) => (
                      <div key={idx} className="card val-score-card">
                        <div className="val-score-top">
                          <span className="val-score-name">{s.dimension}</span>
                          <span className="val-score-num">{s.score}/10</span>
                        </div>
                        <div className="val-score-bar">
                          <div className="val-score-bar-fill" style={{ width: `${s.score * 10}%` }} />
                        </div>
                        <p className="val-score-reason">{s.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── Target Users & Personas ── */}
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

            {/* ── Core Features ── */}
            <section className="spec-section">
              <div className="section-number">03</div>
              <h2 className="section-title">Core Features (MVP Scope)</h2>
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

            {/* ── User Stories ── */}
            <section className="spec-section">
              <div className="section-number">04</div>
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

            {/* ── User Flows ── */}
            {spec.userFlows && (
              <section className="spec-section">
                <div className="section-number">05</div>
                <h2 className="section-title">Key User Flows</h2>
                <div className="user-flows-layout">
                  {spec.userFlows.map((flow, i) => (
                    <div key={i} className="card flow-card">
                      <div className="card-label">Flow {i + 1}: {flow.name}</div>
                      <div className="flow-steps">
                        {flow.steps?.map((step, idx) => (
                          <div key={idx} className="flow-step">
                            <span className="flow-step-num">{idx + 1}</span>
                            <span className="flow-step-text">{step}</span>
                            {idx < flow.steps.length - 1 && <span className="flow-arrow">→</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Tab: Tech Architecture ── */}
        {activeTab === 'tech' && (
          <>
            {/* ── Tech Stack ── */}
            <section className="spec-section">
              <div className="section-number">01</div>
              <h2 className="section-title">Tech Stack Recommendation</h2>
              <div className="tech-categories">
                {[
                  { key: 'frontend', label: 'Frontend', icon: '🎨' },
                  { key: 'backend', label: 'Backend', icon: '⚙️' },
                  { key: 'database', label: 'Database', icon: '🗄️' },
                  { key: 'infrastructure', label: 'Infrastructure', icon: '☁️' },
                  { key: 'ai', label: 'AI / ML Services', icon: '🤖' },
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

            {/* ── Database Schema ── */}
            {spec.databaseSchema && (
              <section className="spec-section">
                <div className="section-number">02</div>
                <h2 className="section-title">Database Schema</h2>
                <div className="schema-grid">
                  {spec.databaseSchema.map((tbl, i) => (
                    <div key={i} className="card schema-card">
                      <div className="schema-table-header">
                        <span className="table-icon">🗄️</span>
                        <span className="table-name">{tbl.table}</span>
                      </div>
                      <table className="schema-table">
                        <thead>
                          <tr>
                            <th>Column</th>
                            <th>Type</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tbl.columns?.map((col, idx) => (
                            <tr key={idx}>
                              <td className="col-name">{col.name}</td>
                              <td className="col-type"><code>{col.type}</code></td>
                              <td className="col-notes">{col.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── API Requirements ── */}
            {spec.apiEndpoints && (
              <section className="spec-section">
                <div className="section-number">03</div>
                <h2 className="section-title">API Requirements</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="api-table">
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Path</th>
                        <th>Description</th>
                        <th>Auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spec.apiEndpoints.map((endpoint, i) => (
                        <tr key={i}>
                          <td>
                            <span className={`api-method ${endpoint.method?.toLowerCase()}`}>
                              {endpoint.method}
                            </span>
                          </td>
                          <td className="api-path"><code>{endpoint.path}</code></td>
                          <td className="api-desc">{endpoint.description}</td>
                          <td className="api-auth">
                            {endpoint.auth ? (
                              <span className="auth-badge required">Required</span>
                            ) : (
                              <span className="auth-badge public">Public</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── Frontend Pages ── */}
            {spec.frontendPages && (
              <section className="spec-section">
                <div className="section-number">04</div>
                <h2 className="section-title">Frontend Pages</h2>
                <div className="pages-grid">
                  {spec.frontendPages.map((page, i) => (
                    <div key={i} className="card page-card">
                      <div className="page-header-row">
                        <span className="page-name">{page.page}</span>
                        <span className="page-route"><code>{page.route}</code></span>
                      </div>
                      <p className="page-desc">{page.description}</p>
                      {page.components && (
                        <div className="page-components" style={{ marginTop: 12 }}>
                          <span className="comp-label">Components</span>
                          <div className="comp-chips">
                            {page.components.map((comp, idx) => (
                              <span key={idx} className="comp-chip">{comp}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Auth, Payments, Integrations ── */}
            <section className="spec-section">
              <div className="section-number">05</div>
              <h2 className="section-title">Integrations & Architecture</h2>
              <div className="two-col">
                {spec.authFlow && (
                  <div className="card">
                    <div className="card-label">🔐 Authentication Flow</div>
                    <div className="integration-row">
                      <span className="integration-label">Provider</span>
                      <span className="integration-value">{spec.authFlow.provider}</span>
                    </div>
                    <div className="integration-row">
                      <span className="integration-label">Method</span>
                      <span className="integration-value">{spec.authFlow.method}</span>
                    </div>
                    <p className="card-text" style={{ marginTop: 12 }}>{spec.authFlow.details}</p>
                  </div>
                )}

                {spec.paymentIntegration && (
                  <div className="card">
                    <div className="card-label">💳 Payment Integration</div>
                    <div className="integration-row">
                      <span className="integration-label">Provider</span>
                      <span className="integration-value">{spec.paymentIntegration.provider}</span>
                    </div>
                    <div className="integration-row">
                      <span className="integration-label">Billing Model</span>
                      <span className="integration-value">{spec.paymentIntegration.model}</span>
                    </div>
                    <p className="card-text" style={{ marginTop: 12 }}>{spec.paymentIntegration.details}</p>
                  </div>
                )}
              </div>

              {spec.thirdPartyAPIs && spec.thirdPartyAPIs.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-label">🔌 Third-Party APIs</div>
                  <table className="integration-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-tertiary)' }}>Service</th>
                        <th style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-tertiary)' }}>Purpose</th>
                        <th style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-tertiary)' }}>Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spec.thirdPartyAPIs.map((api, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{api.name}</td>
                          <td style={{ padding: '12px 0', fontSize: 14, color: 'var(--text-secondary)' }}>{api.purpose}</td>
                          <td style={{ padding: '12px 0', fontSize: 14, fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{api.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Security & Compliance ── */}
            {spec.securityConsiderations && (
              <section className="spec-section">
                <div className="section-number">06</div>
                <h2 className="section-title">Security Considerations</h2>
                <div className="security-grid">
                  {spec.securityConsiderations.map((sec, i) => (
                    <div key={i} className="card security-card">
                      <div className="card-label">🛡️ {sec.area}</div>
                      <p className="card-text">{sec.implementation}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Tab: Strategy & Cost ── */}
        {activeTab === 'business' && (
          <>
            {/* ── Competitive Landscape & SWOT ── */}
            {spec.competitiveLandscape && (
              <section className="spec-section">
                <div className="section-number">01</div>
                <h2 className="section-title">Competitor Analyzer</h2>
                {spec.competitiveLandscape.differentiator && (
                  <div className="card differentiator-card">
                    <div className="card-label">Your Unfair Advantage / Differentiator</div>
                    <p className="card-text differentiator-text">{spec.competitiveLandscape.differentiator}</p>
                  </div>
                )}

                <div className="competitors-grid">
                  {spec.competitiveLandscape.competitors?.map((c, i) => (
                    <div key={i} className="card competitor-card" style={{ paddingBottom: 16 }}>
                      <div className="competitor-name">{c.name}</div>
                      <div className="competitor-row"><span className="comp-label strength">✓ Strength</span><span>{c.strength}</span></div>
                      <div className="competitor-row" style={{ borderBottom: c.swot ? '1px solid var(--border)' : 'none', paddingBottom: 12 }}><span className="comp-label weakness">✗ Weakness</span><span>{c.weakness}</span></div>

                      {c.swot && (
                        <div className="swot-block" style={{ marginTop: 12 }}>
                          <span className="card-label" style={{ fontSize: 11 }}>SWOT Matrix</span>
                          <div className="swot-grid">
                            <div className="swot-quad s"><strong>S</strong>: {c.swot.strengths?.join(', ')}</div>
                            <div className="swot-quad w"><strong>W</strong>: {c.swot.weaknesses?.join(', ')}</div>
                            <div className="swot-quad o"><strong>O</strong>: {c.swot.opportunities?.join(', ')}</div>
                            <div className="swot-quad t"><strong>T</strong>: {c.swot.threats?.join(', ')}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="two-col" style={{ marginTop: 16 }}>
                  {spec.competitiveLandscape.opportunityGaps && (
                    <div className="card">
                      <div className="card-label">Opportunity Gaps</div>
                      <ul className="scaling-list">
                        {spec.competitiveLandscape.opportunityGaps.map((gap, i) => (
                          <li key={i} className="scaling-item">{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {spec.competitiveLandscape.missingFeatures && (
                    <div className="card">
                      <div className="card-label">Unserved Market Demands</div>
                      <ul className="scaling-list">
                        {spec.competitiveLandscape.missingFeatures.map((feat, i) => (
                          <li key={i} className="scaling-item">{feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Pricing Model & Monetization ── */}
            {spec.pricingModel && (
              <section className="spec-section">
                <div className="section-number">02</div>
                <h2 className="section-title">Suggested Pricing Model</h2>
                <div className="pricing-header" style={{ marginBottom: 20 }}>
                  <div className="card">
                    <div className="card-label">Pricing Strategy</div>
                    <p className="card-text" style={{ fontSize: 16, fontWeight: 500 }}>{spec.pricingModel.strategy}</p>
                  </div>
                </div>

                <div className="pricing-grid">
                  {spec.pricingModel.tiers?.map((tier, i) => (
                    <div key={i} className="card pricing-card">
                      <div className="pricing-tier-name">{tier.name}</div>
                      <div className="pricing-tier-price">{tier.price}</div>
                      {tier.limits && <div className="pricing-tier-limits">{tier.limits}</div>}
                      <ul className="pricing-features">
                        {tier.features?.map((feat, idx) => (
                          <li key={idx} className="pricing-feat-item">✓ {feat}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {spec.pricingModel.pathToFirstRevenue && (
                  <div className="card" style={{ marginTop: 16 }}>
                    <div className="card-label">Path to First $1,000 MRR</div>
                    <p className="card-text">{spec.pricingModel.pathToFirstRevenue}</p>
                  </div>
                )}
              </section>
            )}

            {/* ── Timeline ── */}
            <section className="spec-section">
              <div className="section-number">03</div>
              <h2 className="section-title">Development Timeline</h2>
              {timelineData.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 24 }}>
                  <div className="card-label">Weeks Per Phase</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={timelineData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" tick={{ fill:'#737373', fontSize:12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill:'#1A1A1A', fontSize:12 }} width={160} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="weeks" fill="#D97757" radius={[0, 6, 6, 0]} barSize={20} name="Weeks" />
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

            {/* ── Cost Estimate ── */}
            <section className="spec-section">
              <div className="section-number">04</div>
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
                          <XAxis type="number" tick={{ fill:'#737373', fontSize:11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill:'#1A1A1A', fontSize:11 }} width={140} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="hours" fill="#1A1A1A" radius={[0, 4, 4, 0]} barSize={16} name="Hours" />
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

            {/* ── Risks & Roadmaps ── */}
            <section className="spec-section">
              <div className="section-number">05</div>
              <h2 className="section-title">Risks & Scope Mapping</h2>
              <div className="two-col">
                {spec.v1VsV2 && (
                  <div className="card">
                    <div className="card-label">V1 (MVP Scope)</div>
                    <ul className="scaling-list">
                      {spec.v1VsV2.v1?.map((item, idx) => (
                        <li key={idx} className="scaling-item" style={{ borderBottom: 'none', padding: '6px 0' }}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {spec.v1VsV2 && (
                  <div className="card">
                    <div className="card-label">V2 (Future Roadmap)</div>
                    <ul className="scaling-list">
                      {spec.v1VsV2.v2?.map((item, idx) => (
                        <li key={idx} className="scaling-item" style={{ borderBottom: 'none', padding: '6px 0' }}>→ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {spec.futureScope && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-label">Long-Term Vision</div>
                  <p className="card-text">{spec.futureScope.longTermVision}</p>
                </div>
              )}

              <div className="risks-layout" style={{ marginTop: 16 }}>
                {riskData.length > 0 && (
                  <div className="chart-card chart-card-sm">
                    <div className="card-label">Risk Severity</div>
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

            {/* ── Launch Checklist & Next Steps ── */}
            <section className="spec-section">
              <div className="section-number">06</div>
              <h2 className="section-title">Launch & Execution Plan</h2>
              {spec.launchChecklist && (
                <div className="card">
                  <div className="card-label">🚀 Launch Checklist</div>
                  <div className="checklist-layout" style={{ marginTop: 12 }}>
                    {['pre-launch', 'launch-day', 'post-launch'].map(cat => {
                      const items = spec.launchChecklist.filter(item => item.category === cat)
                      if (!items.length) return null
                      return (
                        <div key={cat} className="checklist-category" style={{ marginBottom: 16 }}>
                          <span className="card-label" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{cat.toUpperCase()}</span>
                          <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 6 }}>
                            {items.map((item, idx) => (
                              <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" style={{ accentColor: 'var(--text-primary)' }} readOnly />
                                <span>{item.item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-label">⚡ Next Steps — First 7 Days</div>
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
          </>
        )}

        <footer className="spec-footer">
          <p>Generated by <strong>SpecForge</strong> — AI-Powered MVP Spec Generator</p>
        </footer>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
