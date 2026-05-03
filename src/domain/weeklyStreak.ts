import type { Habit } from '../data/models/Habit'
import type { Completion } from '../data/models/Completion'

type StreakResult = {
  currentStreak: number
  longestStreak: number
}

function mondayAnchor(dt: Date): number {
  const day = (dt.getUTCDay() + 6) % 7 // Monday=0
  const d = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - day)
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}

export function computeWeeklyStreak(habit: Habit, completions: Completion[]): StreakResult {
  // Build weekly totals anchored by Monday for each date
  const weeklyTotals: Record<number, number> = {}
  for (const c of completions) {
    if (c.habitId !== habit.id) continue
    const [yy, mm, dd] = c.date.split('-').map(n => parseInt(n, 10))
    const dt = new Date(Date.UTC(yy, mm - 1, dd))
    const anchor = mondayAnchor(dt)
    weeklyTotals[anchor] = (weeklyTotals[anchor] ?? 0) + c.count
  }

  const completedWeekAnchors = Object.entries(weeklyTotals)
    .filter(([, total]) => total >= habit.target)
    .map(([anchor]) => Number(anchor))
    .sort((a,b) => a - b)

  if (completedWeekAnchors.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Current week anchor based on today
  const now = new Date()
  const todayAnchor = mondayAnchor(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())))
  let current = 0
  let a = todayAnchor
  const anchorSet = new Set<number>(completedWeekAnchors)
  while (anchorSet.has(a)) {
    current++
    a -= 7 * 24 * 60 * 60 * 1000
  }

  // Longest streak: sort anchors by time and count consecutive anchors separated by exactly 7 days
  const sortedAnchors = completedWeekAnchors.slice().sort((x, y) => x - y)
  let longest = 0
  let run = 0
  let prev: number | null = null
  for (const t of sortedAnchors) {
    if (prev != null && t - prev === 7 * 24 * 60 * 60 * 1000) {
      run++
    } else {
      run = 1
    }
    if (run > longest) longest = run
    prev = t
  }

  return { currentStreak: current, longestStreak: longest }
}
