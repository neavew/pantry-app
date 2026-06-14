import React, { useEffect, useRef } from 'react'

const CAT_META = {
  fridge: { label: 'Fridge' },
  freezer: { label: 'Freezer' },
  'pantry-shelf': { label: 'Pantry shelf' },
}

function urgencyScore(pantry, store) {
  const staples = pantry.filter(i => i.store === store && i.staple)
  if (!staples.length) return 0
  const bad = staples.filter(i => i.stock === 'low' || i.stock === 'out').length
  return Math.round((bad / staples.length) * 100)
}

function statusText(score) {
  if (score === 0) return 'All stocked up'
  if (score < 40) return 'A few things needed'
  if (score < 70) return 'Trip recommended'
  return 'Trip needed soon'
}

function Dial({ store, score, color, trackColor }) {
  const arcRef = useRef(null)
  const needleRef = useRef(null)
  const pctRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    let cur = 0
    const target = score
    cancelAnimationFrame(animRef.current)
    const go = () => {
      if (cur < target) cur = Math.min(cur + 2, target)
      const f = (cur / 100) * 126
      if (arcRef.current) arcRef.current.setAttribute('stroke-dasharray', `${f} ${126 - f}`)
      const angle = -180 + (cur / 100) * 180
      const rad = (angle * Math.PI) / 180
      if (needleRef.current) {
        needleRef.current.setAttribute('cx', (50 + 40 * Math.cos(rad)).toFixed(1))
        needleRef.current.setAttribute('cy', (55 + 40 * Math.sin(rad)).toFixed(1))
      }
      if (pctRef.current) pctRef.current.textContent = cur + '%'
      if (cur < target) animRef.current = requestAnimationFrame(go)
    }
    animRef.current = requestAnimationFrame(go)
    return () => cancelAnimationFrame(animRef.current)
  }, [score])

  return (
    <svg width="100" height="60" viewBox="0 0 100 60" style={{ overflow: 'visible' }}>
      <path d="M10,55 A40,40 0 0,1 90,55" fill="none" stroke={trackColor} strokeWidth="8" strokeLinecap="round" />
      <path ref={arcRef} d="M10,55 A40,40 0 0,1 90,55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray="0 126" />
      <circle ref={needleRef} cx="10" cy="55" r="5" fill={color} />
      <text ref={pctRef} x="50" y="52" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="14" fontWeight="800" fill={color}>0%</text>
    </svg>
  )
}

export default function Dashboard({ pantry, onGoToList }) {
  const stores = [
    { key: 'costco',  label: 'Costco',        color: '#4A86B8', trackColor: '#C8DFF0', borderColor: 'rgba(180,215,240,0.6)' },
    { key: 'grocery', label: 'Grocery Store',  color: '#C4608A', trackColor: '#F5D0E5', borderColor: 'rgba(240,180,210,0.6)' },
  ]

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A3D2E', lineHeight: 1.2 }}>Good morning</h1>
        <p style={{ fontSize: 13, color: '#6A9A84', fontWeight: 600, marginTop: 2 }}>Here's your pantry at a glance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
        {stores.map(s => {
          const score = urgencyScore(pantry, s.key)
          const urgent = pantry
            .filter(i => i.store === s.key && i.staple && (i.stock === 'out' || i.stock === 'low'))
            .sort((a, b) => (a.stock === 'out' ? 0 : 1) - (b.stock === 'out' ? 0 : 1))
            .slice(0, 4)

          return (
            <div
              key={s.key}
              onClick={() => onGoToList(s.key)}
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(8px)',
                borderRadius: 20,
                border: `1px solid ${s.borderColor}`,
                padding: '16px 12px 14px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: s.color, marginBottom: 10 }}>
                {s.label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Dial store={s.key} score={score} color={s.color} trackColor={s.trackColor} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 10 }}>
                {statusText(score)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {urgent.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#2D2D2D' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.stock === 'out' ? '#E87E7E' : '#F5C97A', flexShrink: 0 }} />
                    {item.name}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, marginTop: 8, textAlign: 'center', color: s.color }}>
                Tap to see full list
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
