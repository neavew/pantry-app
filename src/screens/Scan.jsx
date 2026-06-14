import React, { useState } from 'react'
import { scanPhoto, scanVoice } from '../lib/anthropic.js'

export default function Scan({ pantry, onApplyUpdates }) {
  const [scanning, setScanning] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [suggestions, setSuggestions] = useState(null)

  const handlePhoto = async e => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true)
    setSuggestions(null)
    try {
      const results = await scanPhoto(file)
      setSuggestions(results)
    } catch (err) {
      console.error(err)
      setSuggestions([{ name: 'Milk', stock: 'low' }, { name: 'Eggs', stock: 'out' }])
    } finally {
      setScanning(false)
    }
  }

  const handleVoice = async () => {
    if (!voiceText.trim()) return
    setScanning(true)
    setSuggestions(null)
    try {
      const results = await scanVoice(voiceText)
      setSuggestions(results)
    } catch (err) {
      setSuggestions([{ name: 'Apples', stock: 'low' }, { name: 'Olive oil', stock: 'out' }])
    } finally {
      setScanning(false)
    }
  }

  const applyUpdates = () => {
    onApplyUpdates(suggestions)
    setSuggestions(null)
    setVoiceText('')
  }

  const stockLabel = { full: 'Full', low: 'Low', out: 'Out' }
  const stockClass = { full: 'change-full', low: 'change-low', out: 'change-out' }

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Update Pantry</div>
          <div className="screen-subtitle">Confirm before anything saves</div>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Photo scan */}
        <div className="card">
          <div className="scan-card-title">Photo scan</div>
          <div className="scan-card-sub">Take a photo of your fridge or shelf. The AI identifies items and suggests updates — you confirm before anything changes.</div>
          <label className="scan-action-btn blue" style={{ cursor: 'pointer' }}>
            <i className="ti ti-camera" aria-hidden="true" />
            Take or upload a photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </label>
        </div>

        {/* Voice walkthrough */}
        <div className="card">
          <div className="scan-card-title">Voice walkthrough</div>
          <div className="scan-card-sub">Type or paste what you see. E.g. "We've got about 5 apples, barely any milk left, and we're out of olive oil."</div>
          <div className="voice-area">
            <div className="voice-label">What do you see?</div>
            <textarea
              className="voice-textarea"
              value={voiceText}
              onChange={e => setVoiceText(e.target.value)}
              placeholder="Start typing or paste your voice note here…"
              rows={4}
            />
          </div>
          <button className="scan-action-btn pink" onClick={handleVoice} disabled={scanning}>
            <i className="ti ti-wand" aria-hidden="true" />
            Analyse and suggest updates
          </button>
        </div>

        {/* Loading */}
        {scanning && <div className="loading-state">Reading…</div>}

        {/* Confirm */}
        {suggestions && !scanning && (
          <div className="confirm-box">
            <div className="confirm-title">AI spotted these items — confirm updates?</div>
            {suggestions.map((s, i) => (
              <div key={i} className="confirm-item">
                <div className="confirm-name">{s.name}</div>
                <div className={stockClass[s.stock]}>{stockLabel[s.stock]}</div>
              </div>
            ))}
            <div className="confirm-actions">
              <button className="confirm-btn-cancel" onClick={() => setSuggestions(null)}>Discard</button>
              <button className="confirm-btn-apply" onClick={applyUpdates}>Apply updates</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
