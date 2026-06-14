import React, { useState } from 'react'

export default function AddItemModal({ item, onSave, onClose }) {
  const editing = !!item
  const [name, setName] = useState(item?.name ?? '')
  const [cat, setCat] = useState(item?.cat ?? 'fridge')
  const [store, setStore] = useState(item?.store ?? 'costco')
  const [staple, setStaple] = useState(item?.staple ?? true)

  const handleSave = () => {
    if (!name.trim()) return
    if (editing) {
      onSave({ ...item, name: name.trim(), cat, store, staple })
    } else {
      onSave({ name: name.trim(), cat, store, staple, stock: 'full', added_to_list: false, last_bought: new Date().toISOString() })
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
          <input className="modal-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Olive oil" autoFocus />
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
            <button className={`modal-toggle${staple ? ' active-pink' : ''}`} onClick={() => setStaple(true)}>
              Yes — auto-add when low
            </button>
            <button className={`modal-toggle${!staple ? ' active-pink' : ''}`} onClick={() => setStaple(false)}>
              No — manual only
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={handleSave}>Add item</button>
        </div>
      </div>
    </div>
  )
}
