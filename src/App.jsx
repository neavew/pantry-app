import React, { useState, useEffect, useCallback } from 'react'
import { fetchPantry, upsertItem, insertItem, subscribeToPantry } from './lib/supabase.js'
import Dashboard from './screens/Dashboard.jsx'
import ShoppingList from './screens/ShoppingList.jsx'
import Pantry from './screens/Pantry.jsx'
import Scan from './screens/Scan.jsx'
import AddItemModal from './components/AddItemModal.jsx'

const NAV = [
  { id: 'home',   icon: 'ti-home',          label: 'Dashboard' },
  { id: 'list',   icon: 'ti-shopping-cart',  label: 'Lists' },
  { id: 'pantry', icon: 'ti-archive',        label: 'Pantry' },
  { id: 'scan',   icon: 'ti-camera',         label: 'Scan' },
]

export default function App() {
  const [screen, setScreen] = useState('home')
  const [pantry, setPantry] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStore, setActiveStore] = useState('costco')
  const [showAdd, setShowAdd] = useState(false)

  // Load pantry from Supabase
  useEffect(() => {
    fetchPantry()
      .then(data => { setPantry(data); setLoading(false) })
      .catch(err => { console.error('Failed to load pantry:', err); setLoading(false) })

    // Realtime sync — when partner updates, this client refreshes
    const channel = subscribeToPantry(() => {
      fetchPantry().then(setPantry).catch(console.error)
    })
    return () => channel.unsubscribe()
  }, [])

  // Helper: update a single item locally + in Supabase
  const updateItem = useCallback(async (id, changes) => {
    setPantry(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
    const item = pantry.find(i => i.id === id)
    if (item) await upsertItem({ ...item, ...changes })
  }, [pantry])

  // Set stock level
  const handleSetStock = useCallback(async (id, stock) => {
    const item = pantry.find(i => i.id === id)
    if (!item) return
    const changes = { stock }
    if (item.staple && (stock === 'low' || stock === 'out') && !item.added_to_list) {
      changes.added_to_list = true
    }
    if (stock === 'full') {
      changes.added_to_list = false
      changes.last_bought = new Date().toISOString()
    }
    await updateItem(id, changes)
  }, [pantry, updateItem])

  // Check off shopping list item (restocks to full)
  const handleCheckOff = useCallback(async (id) => {
    const item = pantry.find(i => i.id === id)
    if (!item) return
    // Toggle checked_off locally for UI feedback
    setPantry(prev => prev.map(i => i.id === id ? { ...i, checked_off: !i.checked_off } : i))
    if (!item.checked_off) {
      // After 900ms, restock to full
      setTimeout(async () => {
        const changes = { stock: 'full', added_to_list: false, checked_off: false, last_bought: new Date().toISOString() }
        setPantry(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
        await upsertItem({ ...item, ...changes })
      }, 900)
    }
  }, [pantry])

  // Manually add item to shopping list
  const handleAddToList = useCallback(async (id) => {
    await updateItem(id, { added_to_list: true })
  }, [updateItem])

  // Add new item
  const handleAddItem = useCallback(async (newItem) => {
    try {
      const saved = await insertItem(newItem)
      setPantry(prev => [...prev, saved])
    } catch (err) {
      console.error('Failed to add item:', err)
    }
  }, [])

  // Apply scan results
  const handleApplyScan = useCallback(async (suggestions) => {
    for (const s of suggestions) {
      const existing = pantry.find(i => i.name.toLowerCase() === s.name.toLowerCase())
      if (existing) {
        await handleSetStock(existing.id, s.stock)
      } else {
        await handleAddItem({
          name: s.name, cat: 'fridge', store: 'grocery',
          staple: false, stock: s.stock,
          added_to_list: s.stock !== 'full',
          last_bought: new Date().toISOString(),
        })
      }
    }
  }, [pantry, handleSetStock, handleAddItem])

  const goToList = (store) => {
    setActiveStore(store)
    setScreen('list')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Nunito, sans-serif', color: '#6A9A84', fontWeight: 700, fontSize: 15 }}>
        Loading your pantry…
      </div>
    )
  }

  return (
    <div className="app">
      {screen === 'home'   && <Dashboard pantry={pantry} onGoToList={goToList} />}
      {screen === 'list'   && <ShoppingList pantry={pantry} activeStore={activeStore} onSetStore={setActiveStore} onCheckOff={handleCheckOff} onAddToList={handleAddToList} />}
      {screen === 'pantry' && <Pantry pantry={pantry} onSetStock={handleSetStock} onOpenAdd={() => setShowAdd(true)} />}
      {screen === 'scan'   && <Scan pantry={pantry} onApplyUpdates={handleApplyScan} />}

      <nav className="bottom-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-btn${screen === n.id ? ' active' : ''}`}
            onClick={() => setScreen(n.id)}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" />
            {n.label}
          </button>
        ))}
      </nav>

      {showAdd && <AddItemModal onSave={handleAddItem} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
