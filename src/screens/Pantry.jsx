import React, { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const CATEGORIES = ['fridge', 'freezer', 'cupboard', 'toiletries', 'household']
const CAT_META = {
  fridge:      { label: 'Fridge',      icon: 'ti-fridge',    bg: '#4A86B8' },
  freezer:     { label: 'Freezer',     icon: 'ti-snowflake', bg: '#7BAFD4' },
  cupboard:    { label: 'Cupboard',    icon: 'ti-archive',   bg: '#7DC4A0' },
  toiletries:  { label: 'Toiletries',  icon: 'ti-droplet',   bg: '#C4608A' },
  household:   { label: 'Household',   icon: 'ti-home',      bg: '#B07DC4' },
}

function SortableItem({ item, editing, onSetStock, onEditItem, onDeleteItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 8px',
        background: 'rgba(214,239,227,0.3)',
        borderRadius: 12,
      }}
    >
      {editing && (
        <div {...attributes} {...listeners} style={{ touchAction: 'none', cursor: 'grab', color: '#B0CEC0', padding: '0 2px', flexShrink: 0 }}>
          <i className="ti ti-grip-vertical" style={{ fontSize: 18 }} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3D2E' }}>
          {item.name}
          {item.staple && <span className="staple-badge">staple</span>}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#8ABAA8', marginTop: 1 }}>
          {item.store === 'costco' ? 'Costco' : 'Grocery Store'}
        </div>
      </div>
      {!editing && (
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
      )}
      {editing && (
        <>
          <button onClick={() => onEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#8ABAA8', flexShrink: 0 }}>
            <i className="ti ti-pencil" style={{ fontSize: 16 }} />
          </button>
          <button onClick={() => onDeleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#CCAAA8', flexShrink: 0 }}>
            <i className="ti ti-trash" style={{ fontSize: 16 }} />
          </button>
        </>
      )}
    </div>
  )
}

export default function Pantry({ pantry, onSetStock, onOpenAdd, onDeleteItem, onEditItem, onReorder }) {
  const [openCats, setOpenCats] = useState({})
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const toggleCat = cat => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }))

  const handleDragEnd = (cat, items) => event => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    onReorder(cat, arrayMove(items, oldIndex, newIndex).map(i => i.id))
  }

  const handleDelete = id => setConfirmDelete(id)
  const confirmAndDelete = () => { onDeleteItem(confirmDelete); setConfirmDelete(null) }

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Inventory</div>
          <div className="screen-subtitle">
            {editing ? 'Drag to reorder · pencil to edit · bin to delete' : 'Tap Full / Low / Out to update'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!editing && <button className="btn-primary" onClick={onOpenAdd}>+ Add</button>}
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
        {CATEGORIES.map(cat => {
          const items = pantry
            .filter(i => i.cat === cat)
            .sort((a, b) => {
              if (a.staple !== b.staple) return a.staple ? -1 : 1
              return (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
            })
          const meta = CAT_META[cat]
          const isOpen = openCats[cat]
          return (
            <div key={cat} style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(180,220,200,0.3)' }}>
              <div onClick={() => toggleCat(cat)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={e => { e.stopPropagation(); onOpenAdd(cat) }}
                  title={`Add to ${meta.label}`}
                  style={{ width: 32, height: 32, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
                  className="cat-icon-btn"
                >
                  <i className={`ti ${meta.icon} cat-icon-default`} aria-hidden="true" style={{ fontSize: 17, color: '#fff', position: 'absolute' }} />
                  <i className="ti ti-plus cat-icon-hover" aria-hidden="true" style={{ fontSize: 17, color: '#fff', position: 'absolute' }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1A3D2E', flex: 1 }}>{meta.label}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8ABAA8' }}>{items.length} items</div>
                <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: 16, color: '#8ABAA8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </div>
              {isOpen && (
                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.length === 0
                    ? <div className="empty-state" style={{ padding: '10px 0' }}>No items in this category yet</div>
                    : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(cat, items)}>
                        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                          {items.map(item => (
                            <SortableItem
                              key={item.id}
                              item={item}
                              editing={editing}
                              onSetStock={onSetStock}
                              onEditItem={onEditItem}
                              onDeleteItem={handleDelete}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete item?</div>
            <div className="modal-sub">This will permanently remove it from your inventory.</div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 14 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 800, background: '#C4608A', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer' }} onClick={confirmAndDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
