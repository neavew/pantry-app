import React, { useState } from 'react'

const CAT_META = {
  fridge: 'Fridge',
  freezer: 'Freezer',
  'pantry-shelf': 'Pantry shelf',
}

const STOCK_ORDER = ['out', 'low', 'full']

export default function ShoppingList({ pantry, activeStore, onSetStore, onCheckOff, onRemoveFromList, onAddToList }) {
  const items = pantry.filter(i => i.store === activeStore && i.added_to_list)
  const byCategory = {}
  items.forEach(i => {
    if (!byCategory[i.cat]) byCategory[i.cat] = []
    byCategory[i.cat].push(i)
  })

  const suggestions = pantry.filter(
    i => i.store === activeStore && !i.staple && !i.added_to_list &&
    (Date.now() - new Date(i.last_bought).getTime()) > 20 * 864e5
  )

  const outItems = pantry.filter(i => i.store === activeStore && !i.added_to_list && i.stock === 'out')
  const lowItems = pantry.filter(i => i.store === activeStore && !i.added_to_list && i.stock === 'low')

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Shopping Lists</div>
          <div className="screen-subtitle">Tap to mark as bought</div>
        </div>
      </div>

      {/* Store tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
        {['costco', 'grocery'].map(store => (
          <button
            key={store}
            onClick={() => onSetStore(store)}
            style={{
              flex: 1, padding: 8, borderRadius: 12, border: 'none',
              fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: activeStore === store
                ? (store === 'costco' ? '#4A86B8' : '#C4608A')
                : (store === 'costco' ? 'rgba(212,232,247,0.7)' : 'rgba(247,212,232,0.7)'),
              color: activeStore === store ? '#fff' : (store === 'costco' ? '#4A86B8' : '#C4608A'),
              transition: 'all 0.15s',
            }}
          >
            {store === 'costco' ? 'Costco' : 'Grocery Store'}
          </button>
        ))}
      </div>

      {/* Active list */}
      {items.length === 0 ? (
        <div className="empty-state">All stocked up — nothing on the list right now.</div>
      ) : (
        Object.keys(byCategory).map(cat => (
          <div key={cat} style={{ padding: '0 16px', marginBottom: 16 }}>
            <div className="section-label">{CAT_META[cat] || cat}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {byCategory[cat]
                .sort((a, b) => STOCK_ORDER.indexOf(a.stock) - STOCK_ORDER.indexOf(b.stock))
                .map(item => (
                  <div key={item.id} style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(180,220,200,0.3)' }}>
                    <div
                      onClick={() => onCheckOff(item.id)}
                      style={{
                        width: 22, height: 22, borderRadius: 7,
                        border: item.checked_off ? 'none' : '2px solid #C8DEC8',
                        background: item.checked_off ? '#7DC4A0' : 'transparent',
                        cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, color: '#fff', fontWeight: 800,
                      }}
                    >
                      {item.checked_off ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3D2E', textDecoration: item.checked_off ? 'line-through' : 'none', opacity: item.checked_off ? 0.5 : 1 }}>
                        {item.name}
                      </div>
                      <span className={`badge-${item.stock}`}>
                        {item.stock === 'out' ? 'Out of stock' : 'Running low'}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveFromList(item.id)}
                      title="Remove from list"
                      style={{
                        width: 26, height: 26, borderRadius: 8, border: 'none',
                        background: 'rgba(180,180,180,0.2)', color: '#999',
                        fontSize: 16, lineHeight: 1, cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >×</button>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      {/* Suggestions box */}
      <div style={{ margin: '0 16px 10px' }} className="card">
        <div className="section-label">Suggestions — not bought recently</div>
        {suggestions.length === 0
          ? <div style={{ fontSize: 12, color: '#8ABAA8', fontWeight: 600, textAlign: 'center', padding: '6px 0' }}>No suggestions right now</div>
          : suggestions.map(i => (
            <div key={i.id} className="suggestion-row">
              <div>
                <div className="suggestion-name">{i.name}</div>
                <div className="suggestion-sub">Last bought {Math.round((Date.now() - new Date(i.last_bought).getTime()) / 864e5)}d ago</div>
              </div>
              <button className="add-btn" onClick={() => onAddToList(i.id)}>+ Add</button>
            </div>
          ))
        }
      </div>

      {/* Pantry status box */}
      <div style={{ margin: '0 16px 16px' }} className="card">
        <div className="section-label">Pantry status — not on list yet</div>
        {outItems.length === 0 && lowItems.length === 0
          ? <div style={{ fontSize: 12, color: '#8ABAA8', fontWeight: 600, textAlign: 'center', padding: '6px 0' }}>Everything else is fully stocked</div>
          : (
            <>
              {outItems.length > 0 && (
                <>
                  <div className="stock-divider"><div className="stock-divider-line" /><span className="label-out">Out of stock</span><div className="stock-divider-line" /></div>
                  {outItems.map(i => (
                    <div key={i.id} className="suggestion-row">
                      <div>
                        <div className="suggestion-name">{i.name}</div>
                        <div className="suggestion-sub">{i.staple ? 'Staple' : 'Non-staple'} · {CAT_META[i.cat] || i.cat}</div>
                      </div>
                      <button className="add-btn" onClick={() => onAddToList(i.id)}>+ Add</button>
                    </div>
                  ))}
                </>
              )}
              {lowItems.length > 0 && (
                <>
                  <div className="stock-divider"><div className="stock-divider-line" /><span className="label-low">Running low</span><div className="stock-divider-line" /></div>
                  {lowItems.map(i => (
                    <div key={i.id} className="suggestion-row">
                      <div>
                        <div className="suggestion-name">{i.name}</div>
                        <div className="suggestion-sub">{i.staple ? 'Staple' : 'Non-staple'} · {CAT_META[i.cat] || i.cat}</div>
                      </div>
                      <button className="add-btn" onClick={() => onAddToList(i.id)}>+ Add</button>
                    </div>
                  ))}
                </>
              )}
            </>
          )
        }
      </div>
    </div>
  )
}
