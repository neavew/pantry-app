import React, { useState } from 'react'

function AddMealPrepModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [size, setSize] = useState('')

  const handleSave = () => {
    if (!name.trim() || !size.trim()) return
    onSave({ name: name.trim(), size: size.trim(), count: 1 })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Add meal prep item</div>
        <div className="modal-sub">Track a batch-cooked item by name and portion size</div>
        <div className="modal-field">
          <label className="modal-label">Item name</label>
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chili, Beef Broth, Rice" autoFocus />
        </div>
        <div className="modal-field">
          <label className="modal-label">Portion size</label>
          <input className="modal-input" value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. Individual portion, Large portion, Small cube" />
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={handleSave}>Add</button>
        </div>
      </div>
    </div>
  )
}

function EditMealPrepModal({ item, onSave, onClose }) {
  const [name, setName] = useState(item.name)
  const [size, setSize] = useState(item.size)

  const handleSave = () => {
    if (!name.trim() || !size.trim()) return
    onSave({ ...item, name: name.trim(), size: size.trim() })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Edit item</div>
        <div className="modal-field">
          <label className="modal-label">Item name</label>
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="modal-field">
          <label className="modal-label">Portion size</label>
          <input className="modal-input" value={size} onChange={e => setSize(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function MealPrep({ items, onAdd, onUpdate, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editing, setEditing] = useState(false)

  const handleCount = (item, delta) => {
    const next = Math.max(0, item.count + delta)
    onUpdate({ ...item, count: next })
  }

  // Group by name (case-insensitive), preserving first-seen order
  const groups = []
  const seen = {}
  items.forEach(item => {
    const key = item.name.toLowerCase()
    if (!seen[key]) {
      seen[key] = { name: item.name, entries: [] }
      groups.push(seen[key])
    }
    seen[key].entries.push(item)
  })

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Meal Prep</div>
          <div className="screen-subtitle">
            {editing ? 'Tap pencil to edit · bin to delete' : 'Tap + / − to update counts'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!editing && (
            <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add</button>
          )}
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
              background: editing ? '#1A3D2E' : 'rgba(255,255,255,0.7)',
              color: editing ? '#fff' : '#1A3D2E',
            }}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.length === 0 ? (
          <div className="empty-state">No meal prep items yet — tap + Add to get started.</div>
        ) : (
          groups.map(group => (
            <div key={group.name} style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(180,220,200,0.3)' }}>
              <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1A3D2E' }}>{group.name}</div>
                {editing && (
                  <button
                    onClick={() => setShowAdd(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7DC4A0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12 }}
                  >
                    + size
                  </button>
                )}
              </div>
              <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.entries.map(entry => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 8px',
                      background: 'rgba(214,239,227,0.3)',
                      borderRadius: 12,
                      opacity: entry.count === 0 ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D2E' }}>{entry.size}</div>
                    </div>

                    {!editing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleCount(entry, -1)}
                          style={{
                            width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
                            background: 'rgba(180,220,200,0.4)', color: '#1A3D2E',
                            fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >−</button>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A3D2E', minWidth: 24, textAlign: 'center' }}>
                          {entry.count}
                        </div>
                        <button
                          onClick={() => handleCount(entry, 1)}
                          style={{
                            width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
                            background: 'rgba(180,220,200,0.4)', color: '#1A3D2E',
                            fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >+</button>
                      </div>
                    )}

                    {editing && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setEditingItem(entry)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#8ABAA8' }}>
                          <i className="ti ti-pencil" style={{ fontSize: 16 }} />
                        </button>
                        <button onClick={() => setConfirmDelete(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#CCAAA8' }}>
                          <i className="ti ti-trash" style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && <AddMealPrepModal onSave={onAdd} onClose={() => setShowAdd(false)} />}
      {editingItem && <EditMealPrepModal item={editingItem} onSave={onUpdate} onClose={() => setEditingItem(null)} />}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete item?</div>
            <div className="modal-sub">This will permanently remove it from your meal prep tracker.</div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 800, background: '#C4608A', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer' }} onClick={() => { onDelete(confirmDelete); setConfirmDelete(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
