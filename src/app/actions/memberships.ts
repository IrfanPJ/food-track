'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MembershipPlan } from '@/types'

export async function getPlans(): Promise<MembershipPlan[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true)
      .order('duration_months', { ascending: true })

    if (error) throw error

    return (data ?? []) as MembershipPlan[]
  } catch (err) {
    console.error('getPlans error:', err)
    return []
  }
}

export async function createMembership(data: {
  member_id: string
  plan_id: string
  start_date: string
  amount: number
}): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await createClient()

    // Fetch plan to calculate expiry_date
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('duration_months')
      .eq('id', data.plan_id)
      .single()

    if (planError || !plan) {
      throw new Error('Plan not found')
    }

    const durationMonths = (plan as { duration_months: number }).duration_months
    const startDate = new Date(data.start_date)
    const expiryDate = new Date(startDate)
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths)

    const { data: inserted, error } = await supabase
      .from('memberships')
      .insert({
        member_id: data.member_id,
        plan_id: data.plan_id,
        start_date: data.start_date,
        expiry_date: expiryDate.toISOString().slice(0, 10),
        amount: data.amount,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) throw error

    revalidatePath('/members')
    return { id: (inserted as { id: string }).id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}

export async function renewMembership(
  memberId: string,
  data: { plan_id: string; start_date: string; amount: number }
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    // Mark existing active memberships as expired
    const { error: expireError } = await supabase
      .from('memberships')
      .update({ status: 'expired' })
      .eq('member_id', memberId)
      .eq('status', 'active')

    if (expireError) throw expireError

    // Fetch plan to calculate expiry_date
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('duration_months')
      .eq('id', data.plan_id)
      .single()

    if (planError || !plan) {
      throw new Error('Plan not found')
    }

    const durationMonths = (plan as { duration_months: number }).duration_months
    const startDate = new Date(data.start_date)
    const expiryDate = new Date(startDate)
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths)

    const { error: insertError } = await supabase.from('memberships').insert({
      member_id: memberId,
      plan_id: data.plan_id,
      start_date: data.start_date,
      expiry_date: expiryDate.toISOString().slice(0, 10),
      amount: data.amount,
      status: 'active',
    })

    if (insertError) throw insertError

    revalidatePath('/members')
    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}

export async function updatePlan(
  id: string,
  data: Partial<MembershipPlan>
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = data

    const { error } = await supabase
      .from('membership_plans')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/memberships')
    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}

export async function createPlan(data: {
  name: string
  duration_months: number
  fee: number
  description?: string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('membership_plans').insert({
      name: data.name,
      duration_months: data.duration_months,
      fee: data.fee,
      description: data.description ?? null,
      is_active: true,
    })

    if (error) throw error

    revalidatePath('/memberships')
    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message }
  }
}
