'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Lead } from '@/types'

export async function getLeads(status?: string): Promise<Lead[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return (data ?? []) as Lead[]
  } catch (err) {
    console.error('getLeads error:', err)
    return []
  }
}

export async function createLead(data: FormData): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    const payload: Record<string, unknown> = {
      name: data.get('name') as string,
      mobile: data.get('mobile') as string,
      source: (data.get('source') as string) || 'walk_in',
      status: 'new',
    }

    const email = data.get('email') as string | null
    if (email) payload.email = email

    const followupDate = data.get('followup_date') as string | null
    if (followupDate) payload.followup_date = followupDate

    const notes = data.get('notes') as string | null
    if (notes) payload.notes = notes

    const { error } = await supabase.from('leads').insert(payload)

    if (error) throw error

    revalidatePath('/leads')
    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}

export async function updateLead(
  id: string,
  data: Partial<Lead>
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    // Strip the id field to avoid updating it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _created, ...updateData } = data

    const { error } = await supabase.from('leads').update(updateData).eq('id', id)

    if (error) throw error

    revalidatePath('/leads')
    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('leads').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/leads')
    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}
