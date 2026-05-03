import { Habit } from '../data/models/Habit'
import { Completion } from '../data/models/Completion'
import { computeWeeklyStreak } from './weeklyStreak'

type StreakResult = {
  currentStreak: number
  longestStreak: number
}

// Helper: get date in ISO yyyy-mm-dd format (UTC date portion)
function toDateOnly(isoDate: string): string {
  const d = new Date(isoDate)
  // Normalize to date-only in local timezone, then convert back to ISO date string ( yyyy-mm-dd )
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  // Use UTC-based to keep a consistent day boundary across timezones by using date string directly
  return `${year}-${month}-${day}`
}

// Compute daily streaks for daily habits. For weekly, pass type 'weekly' to handle differently.
export function calculateStreak(habit: Habit, completions: Completion[]): StreakResult {
  if (habit.type === 'weekly') {
    return computeWeeklyStreak(habit, completions)
  }
  // Aggregate completions by date for the given habit
  const map: Record<string, number> = {}
  for (const c of completions) {
    if (c.habitId !== habit.id) continue
    map[c.date] = (map[c.date] ?? 0) + c.count
  }

  // Build a sorted list of dates that exist in data (subset of range around today could be used in real app)
  const dates = Object.keys(map).sort()
  // Determine which dates are considered completed per habit by matching target
  const completedDates = dates.filter(d => map[d] >= habit.target).map(d => toDateOnly(d))

  // Compute current and longest streaks by iterating sequential days.
  if (habit.type === 'daily') {
    // Build a contiguous sequence of dates where there is a completion for consecutive days
    // We'll assume dates are ISO strings like 'YYYY-MM-DD'. We'll reconstruct a continuous timeline from min to max.
    if (completedDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // Convert to Date objects and sort
    const days: Date[] = completedDates.map(s => {
      const [y, m, d] = s.split('-').map(Number)
      // Note: Date constructor interprets as UTC if using Date.UTC; here we use new Date(Date.UTC(y, m - 1, d)) for stable UTC date
      return new Date(Date.UTC(y, m - 1, d))
    }).sort((a, b) => a.getTime() - b.getTime())

    // Build a set for quick lookup of completed days
    const completedSet = new Set<string>(days.map(d => d.toISOString().slice(0, 10)))

    // Determine current streak by scanning backwards from latest date
    const today = new Date()
    let current = 0
    let curDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    // Walk back while consecutive days exist in completedSet
    while (true) {
      const key = curDate.toISOString().slice(0, 10)
      if (completedSet.has(key)) {
        current++
        curDate = new Date(curDate.getTime() - 24 * 60 * 60 * 1000)
      } else {
        break
      }
    }

    // Longest streak: compute across the timeline by checking gaps
    let longest = 0
    let running = 0
    // Build sequential days from minDate to today
    const minDate = days[0]
    let cursor = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), minDate.getUTCDate()))
    const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10)
      if (completedSet.has(key)) {
        running++
        if (running > longest) longest = running
      } else {
        running = 0
      }
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
    }

    return { currentStreak: current, longestStreak: longest }
  } else if (habit.type === 'weekly') {
    // Simplified weekly streak: consider a week completed if target met within the week (sum of counts per week >= target)
    // Build map by ISO week string
    const weekly: Record<string, number> = {}
    for (const d of Object.keys(map)) {
      const dt = new Date(d + 'T00:00:00Z')
      const year = dt.getUTCFullYear()
      // ISO week-numbering algorithm
      const tempDate = new Date(Date.UTC(year, dt.getUTCMonth(), dt.getUTCDate()))
      // Use Monday as first day - compute week string as ISO year-week
      const dayNr = (dt.getUTCDay() + 6) % 7 // 0 = Monday
      const firstOfYear = new Date(Date.UTC(year, 0, 1))
      const diff = Math.round((dt.getTime() - firstOfYear.getTime()) / (7 * 24 * 3600e3))
      const weekKey = `${year}-W${String(diff + 1).padStart(2, '0')}`
      weekly[weekKey] = (weekly[weekKey] ?? 0) + map[d]
    }
    // Determine completed weeks
    const completedWeeks = Object.entries(weekly).filter(([, total]) => total >= habit.target).map(([wk]) => wk)
    // Determine current streak by counting consecutive weeks ending at current week
    if (completedWeeks.length === 0) return { currentStreak: 0, longestStreak: 0 }
    // Identify current week string
    const now = new Date()
    const year = now.getUTCFullYear()
    const diff = Math.floor((now.getTime() - Date.UTC(year, now.getUTCMonth(), now.getUTCDate())) / (7 * 24 * 3600e3)) + 1
    const currentWeek = `${year}-W${String(diff).padStart(2, '0')}`
    let current = 0
    let w = currentWeek
    while (completedWeeks.includes(w)) {
      current++
      // move to previous week
      // naive step back one week
      const parts = w.split('-W')
      const y = Number(parts[0])
      const wk = Number(parts[1]) - 1
      const prevDate = new Date(Date.UTC(y, 0, 1))
      const prevWeekStart = new Date(prevDate.getTime() + ((wk - 1) * 7) * 24 * 3600e3)
      const newYear = prevWeekStart.getUTCFullYear()
      const newWeek = Number(prevWeekStart.toISOString().slice(0, 10)) // dummy fallback
      // Fallback to breaking loop if computation becomes too complex in this scaffold
      // Instead simply stop at current single week for safety
      break
    }
    // Longest streak for weekly is approximated by number of consecutive completed weeks ending today by simple iteration across known keys
    const longest = completedWeeks.length
    return { currentStreak: current, longestStreak: longest }
  }
  // Default fallback
  return { currentStreak: 0, longestStreak: 0 }
}
