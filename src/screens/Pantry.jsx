import React, { useState } from 'react'

const CATEGORIES = ['fridge', 'freezer', 'pantry-shelf']
const CAT_META = {
  fridge: { label: 'Fridge', initials: 'FR', bg: '#7DC4A0' },
  freezer: { label: 'Freezer', initials: 'FZ', bg: '#4A86B8' },
  'pantry-shelf': { label: 'Pantry shelf', initials: 'PA', bg: '#C4608A' },
}

export default function Pantry({ pantry, onSetStock, onOpenAdd }) {
  const [openCats, setOpenCats] = useState({})

  const toggleCat = cat => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }))

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Pantry</div>
          <div className="screen-subtitle">Tap Full / Low / Out to update</div>
        </div>
        <button className="btn-primary" onClick={onOpenAdd}>+ Add</button>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CATEGORIES.map(cat => {
          const items = pantry.filter(i => i.cat === cat)
          const meta = CAT_META[cat]
          const isOpen = openCats[cat]
          return (
            <div key={cat} style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(180,220,200,0.3)' }}>
              <div onClick={() => toggleCat(cat)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {meta.initials}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1A3D2E', flex: 1 }}>{meta.label}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8ABAA8' }}>{items.length} items</div>
                <i className={`ti ti-chevron-down`} aria-hidden="true" style={{ fontSize: 16, color: '#8ABAA8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </div>
              {isOpen && (
                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.length === 0
                    ? <div className="empty-state" style={{ padding: '10px 0' }}>No items in this category yet</div>
                    : items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', background: 'rgba(214,239,227,0.3)', borderRadius: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D2E' }}>
                            {item.name}
                            {item.staple && <span className="staple-badge">staple</span>}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#8ABAA8', marginTop: 1 }}>
                            {item.store === 'costco' ? 'Costco' : 'Grocery Store'}
                          </div>
                        </div>
                        <div className="stock-toggle">
                          {['full', 'low', 'out'].map(level => (
                            <button
                              key={level}
                              className={`stock-btn${item.stock === level ? ` active-${level}` : ''}`}
                              onClick={() => onSetStock(item.id, level)}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
