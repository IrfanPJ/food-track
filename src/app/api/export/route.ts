import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'food'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let data: unknown[] = []

    if (type === 'food') {
      let query = supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })

      if (from) query = query.gte('logged_at', from)
      if (to) query = query.lte('logged_at', to)

      const { data: logs } = await query
      data = logs || []
    } else if (type === 'workout') {
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false })

      data = workouts || []
    } else if (type === 'progress') {
      const { data: progress } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })

      data = progress || []
    }

    // Convert to CSV
    if (data.length === 0) {
      return NextResponse.json({ message: 'No data found' })
    }

    const headers = Object.keys(data[0] as object).join(',')
    const rows = data.map((row) =>
      Object.values(row as object)
        .map((v) => (typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v))
        .join(',')
    )
    const csv = [headers, ...rows].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
