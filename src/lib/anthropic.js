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
        text: `You are a pantry tracking assistant. Look at this photo and identify all visible food items. For each item, estimate stock level as: "full" (plenty visible), "low" (only a little left), or "out" (empty or not visible). Return ONLY a JSON array with no preamble or markdown, like: [{"name":"Milk","stock":"low"},{"name":"Eggs","stock":"full"}]`,
      },
    ],
  }])
}

export async function scanVoice(text) {
  return callClaude([{
    role: 'user',
    content: `You are a pantry assistant. The user narrated what they see in their fridge or pantry. Extract each food item mentioned and classify the stock level as "full" (plenty), "low" (running low, a few left), or "out" (none/empty/finishing). Return ONLY a JSON array with no preamble or markdown: [{"name":"Apples","stock":"low"}]. User said: "${text}"`,
  }])
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
