import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Pantry items ──────────────────────────────────────────────

export async function fetchPantry() {
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .order('sort_order')
    .order('name')
  if (error) throw error
  return data
}

export async function upsertItem(item) {
  const { data, error } = await supabase
    .from('pantry_items')
    .upsert(item, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function insertItem(item) {
  const { data, error } = await supabase
    .from('pantry_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Realtime subscription ─────────────────────────────────────

export function subscribeToPantry(onRefresh, onDelete) {
  return supabase
    .channel('pantry_changes')
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pantry_items' }, payload => {
      onDelete(payload.old.id)
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pantry_items' }, onRefresh)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pantry_items' }, onRefresh)
    .subscribe()
}
