import React, { useState, useEffect } from 'react'
import { SUBGROUPS } from '../lib/subgroups.js'
import { suggestSubgroup } from '../lib/anthropic.js'

export default function AddItemModal({ item, initialCat, onSave, onClose }) {
  const editing = !!item
  const [name, setName] = useState(item?.name ?? '')
  const [cat, setCat] = useState(item?.cat ?? initialCat ?? 'fridge')
  const [store, setStore] = useState(item?.store ?? 'costco')
  const [staple, setStaple] = useState(item?.staple ?? false)
  const [subgroup, setSubgroup] = useState(item?.subgroup ?? '')
  const [suggestingSubgroup, setSuggestingSubgroup] = useState(false)

  const subgroups = SUBGROUPS[cat] ?? []

  // When cat changes, reset subgroup if it's not valid for the new cat
  useEffect(() => {
    if (!SUBGROUPS[cat]?.includes(subgroup)) setSubgroup('')
  }, [cat])

  // Auto-suggest subgroup when name is filled in and there are subgroups
  const handleNameBlur = async () => {
    if (!name.trim() || subgroup || subgroups.length === 0) return
    setSuggestingSubgroup(true)
    try {
      const suggestion = await suggestSubgroup(name.trim(), cat, subgroups)
      if (suggestion) setSubgroup(suggestion)
    } finally {
      setSuggestingSubgroup(false)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return
    const sg = subgroups.length > 0 ? (subgroup || 'Other') : null
    if (editing) {
      onSave({ ...item, name: name.trim(), cat, store, staple, subgroup: sg })
    } else {
      onSave({ name: name.trim(), cat, store, staple, subgroup: sg, stock: 'full', added_to_list: false, last_bought: new Date().toISOString() })
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{editing ? 'Edit item' : 'Add item'}</div>
        <div className="modal-sub">{editing ? 'Update the details below' : 'Fill in the details — you can always edit later'}</div>

        <div className="modal-field">
          <label className="modal-label">Item name</label>
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)} onBlur={handleNameBlur} placeholder="e.g. Olive oil" autoFocus />
        </div>

        <div className="modal-field">
          <label className="modal-label">Category</label>
          <select className="modal-select" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
            <option value="cupboard">Cupboard</option>
            <option value="toiletries">Toiletries</option>
            <option value="household">Household</option>
          </select>
        </div>

        {subgroups.length > 0 && (
          <div className="modal-field">
            <label className="modal-label">
              Subgroup
              {suggestingSubgroup && <span style={{ fontSize: 11, fontWeight: 600, color: '#8ABAA8', marginLeft: 8 }}>AI suggesting…</span>}
            </label>
            <select className="modal-select" value={subgroup} onChange={e => setSubgroup(e.target.value)}>
              <option value="">— select —</option>
              {subgroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
            </select>
          </div>
        )}

        <div className="modal-field">
          <label className="modal-label">Store</label>
          <div className="modal-toggle-row">
            {['costco', 'grocery'].map(s => (
              <button
                key={s}
                className={`modal-toggle${store === s ? (s === 'costco' ? ' active-blue' : ' active-pink') : ''}`}
                onClick={() => setStore(s)}
              >
                {s === 'costco' ? 'Costco' : 'Grocery Store'}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label">Is this a staple?</label>
          <div className="modal-toggle-row">
            <button className={`modal-toggle${!staple ? ' active-pink' : ''}`} onClick={() => setStaple(false)}>
              No — manual only
            </button>
            <button className={`modal-toggle${staple ? ' active-pink' : ''}`} onClick={() => setStaple(true)}>
              Yes — auto-add when low
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={handleSave}>{editing ? 'Save' : 'Add item'}</button>
        </div>
      </div>
    </div>
  )
}
