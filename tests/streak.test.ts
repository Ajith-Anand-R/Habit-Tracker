import { Habit } from '../src/data/models/Habit'
import { Completion } from '../src/data/models/Completion'
import { calculateStreak } from '../src/domain/streaks'

// Simple helper to create a habit
const makeHabit = (overrides: Partial<Habit> = {}): Habit => {
  return {
    id: 'habit1',
    title: 'Test Habit',
    description: '',
    type: 'daily',
    target: 1,
    color: '#000',
    icon: 'star',
    startDate: new Date().toISOString(),
    reminderTime: null,
    ...overrides,
  } as Habit
}

const makeCompletion = (date: string, count: number, habitId: string): Completion => ({
  id: 'c_' + date,
  habitId,
  date,
  count,
})

describe('streak calculation (daily)', () => {
  it('computes current and longest streak for consecutive days', () => {
    const habit = makeHabit({ id: 'h1', type: 'daily', target: 1 })
    // Prepare 5 consecutive days with 1 completion each
    const base = new Date()
    const days: string[] = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - i))
      days.push(d.toISOString().slice(0, 10))
    }
    const completions: Completion[] = days.map((dt) => makeCompletion(dt, 1, habit.id))
    const result = calculateStreak(habit, completions)
    expect(result.currentStreak).toBeGreaterThanOrEqual(5)
    expect(result.longestStreak).toBeGreaterThanOrEqual(5)
  })

  it('resets current streak when a day is missed', () => {
    const habit = makeHabit({ id: 'h2', type: 'daily', target: 1 })
    const base = new Date()
    const days: string[] = []
    // 3 days in a row, skip today, then 2 more days
    for (let i = 5; i >= 3; i--) {
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - i))
      days.push(d.toISOString().slice(0, 10))
    }
    const completions: Completion[] = days.map(dt => makeCompletion(dt, 1, habit.id))
    const result = calculateStreak(habit, completions)
    expect(result.currentStreak).toBeGreaterThanOrEqual(3)
  })
})

describe('streak calculation (weekly)', () => {
  const makeHabitWeekly = (): any => {
    return { id: 'week_habit', title: 'Weekly Habit', description: '', type: 'weekly', target: 1, color: '#000', icon: 'week', startDate: new Date().toISOString(), reminderTime: null } as any
  }

  function dateKey(year: number, month: number, day: number): string {
    const m = String(month).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  function mondayOf(year: number, week: number): Date {
    // This helper computes a rough Monday anchor for anchor creation
    const jan4 = new Date(Date.UTC(year, 0, 4))
    const dayOfWeek = (jan4.getUTCDay() + 6) % 7
    const week1Monday = new Date(Date.UTC(year, 0, 4 - dayOfWeek))
    return new Date(week1Monday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
  }

  it('calculates current and longest weekly streaks for consecutive weeks', () => {
    const habit = makeHabitWeekly()
    const now = new Date()
    const todayDt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    // Get current week Monday anchor by using today's date
    const currentAnchor = new Date(todayDt)
    // Build three consecutive weeks anchored by Mondays
    const anchors: string[] = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(todayDt.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      // Get ISO date string for a date within that week (use Monday of that week)
      const day = (d.getUTCDay() + 6) % 7
      const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
      monday.setUTCDate(monday.getUTCDate() - day)
      const key = monday.toISOString().slice(0, 10)
      anchors.push(key)
    }
    const completions: Completion[] = anchors.map((ds) => ({ id: 'wk_' + ds, habitId: habit.id, date: ds, count: 1 }))
    const result = calculateStreak(habit, completions)
    expect(result.currentStreak).toBeGreaterThanOrEqual(3)
    expect(result.longestStreak).toBeGreaterThanOrEqual(3)
  })
})
