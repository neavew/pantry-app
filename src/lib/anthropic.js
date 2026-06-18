const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

async function callClaude(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  const text = data.content.find(c => c.type === 'text')?.text || '[]'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export async function scanPhoto(file) {
  const base64 = await fileToBase64(file)
  return callClaude([{
    role: 'user',
    content: [
      {
        type: 'image',
        source: { type: 'base64', media_type: file.type, data: base64 },
      },
      {
        type: 'text',
        text: `You are a pantry tracking assistant. Look at this photo and identify all visible food items. For each item, estimate stock level as: "full" (plenty visible), "low" (only a little left), or "out" (empty or not visible). Also assign a category — "fridge" (fresh food, dairy, drinks, leftovers), "freezer" (frozen food), "cupboard" (dry goods, tins, bread, pasta, condiments, snacks, cereals), "toiletries" (soap, shampoo, toothpaste, skincare), "household" (cleaning products, batteries, paper towels, bin bags). Return ONLY a JSON array with no preamble or markdown, like: [{"name":"Milk","stock":"low","cat":"fridge"},{"name":"Tinned tuna","stock":"out","cat":"cupboard"}]`,
      },
    ],
  }])
}

export async function scanVoice(text) {
  return callClaude([{
    role: 'user',
    content: `You are a household inventory assistant. The user narrated what they can see or what they need. Extract each item mentioned and classify the stock level as "full" (plenty), "low" (running low, a few left), or "out" (none/empty/finished). Also assign a category — "fridge" (fresh food, dairy, drinks, leftovers), "freezer" (frozen food), "cupboard" (dry goods, tins, bread, pasta, condiments, snacks, cereals), "toiletries" (soap, shampoo, toothpaste, skincare), "household" (cleaning products, batteries, paper towels, bin bags). Return ONLY a JSON array with no preamble or markdown: [{"name":"Apples","stock":"low","cat":"fridge"},{"name":"Bread","stock":"out","cat":"cupboard"}]. User said: "${text}"`,
  }])
}

export async function suggestSubgroup(name, cat, subgroups) {
  if (!subgroups || subgroups.length === 0) return null
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: `Which subgroup does "${name}" belong to in the ${cat} category? Options: ${subgroups.join(', ')}. Reply with ONLY the exact subgroup name, nothing else.`,
      }],
    }),
  })
  if (!res.ok) return 'Other'
  const data = await res.json()
  const reply = data.content.find(c => c.type === 'text')?.text?.trim() ?? 'Other'
  return subgroups.includes(reply) ? reply : 'Other'
}

export async function bulkAssignSubgroups(items) {
  if (items.length === 0) return []

  // Process in batches of 30 to avoid token limits
  const BATCH = 30
  const results = []
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH)
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Assign each item to the correct subgroup. Return ONLY a JSON array with no preamble or markdown.

Subgroup options per category:
- fridge: Dairy, Meat, Fruit, Veg, Other
- freezer: Meat, Fish, Other
- cupboard: Tins, Grains, Snacks, Condiments, Other
- household: Cleaning, Food Storage, Other
- toiletries: null (no subgroups)

Items: ${JSON.stringify(batch.map(i => ({ id: i.id, name: i.name, cat: i.cat })))}

Return: [{"id":"...","subgroup":"..."}]`,
        }],
      }),
    })
    if (!res.ok) {
      console.error('bulkAssignSubgroups API error', res.status, await res.text())
      continue
    }
    const data = await res.json()
    const text = data.content.find(c => c.type === 'text')?.text || '[]'
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      results.push(...parsed)
    } catch (e) {
      console.error('bulkAssignSubgroups parse error', e, text)
    }
  }
  return results
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
