import { Habit } from '../src/data/models/Habit'
import { Completion } from '../src/data/models/Completion'
import { calculateStreak } from '../src/domain/streaks'
import { computeAnalyticsForHabit } from '../src/domain/analytics'

const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'habitA',
  title: 'Analytics Habit',
  description: '',
  type: 'daily',
  target: 1,
  color: '#111',
  icon: 'check',
  startDate: new Date().toISOString(),
  reminderTime: null,
  ...overrides,
})

const makeCompletion = (date: string, count: number, habitId: string): Completion => ({
  id: 'c_' + date,
  habitId,
  date,
  count,
})

describe('analytics computation', () => {
  test('computes completion rate for a habit', () => {
    const habit = makeHabit({ id: 'ha', target: 2 })
    const today = new Date()
    const dates = [0, 1].map(i => {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
      return d.toISOString().slice(0, 10)
    })
    const completions: Completion[] = dates.map((dt) => makeCompletion(dt, 2, habit.id))
    const anal = computeAnalyticsForHabit(habit, completions)
    expect(anal.completionRate).toBeGreaterThanOrEqual(80)
  })
})
