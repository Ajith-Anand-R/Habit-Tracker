import { Habit } from '../data/models/Habit'
import { Completion } from '../data/models/Completion'

export type AnalyticsResult = {
  completionRate: number
  // Simple placeholders for weekly/monthly stats for now
  weekly?: { week: string; total: number }[]
  monthly?: { month: string; total: number }[]
}

export function computeAnalyticsForHabit(habit: Habit, completions: Completion[]): AnalyticsResult {
  const total = completions.filter(c => c.habitId === habit.id).reduce((sum, c) => sum + c.count, 0)
  // Simple rate: total completions divided by theoretical max over time is not known here; assume 7 days cycle for daily habits
  const rate = habit.target > 0 ? Math.min(100, Math.round((total / (habit.target * 30)) * 100)) : 0
  return {
    completionRate: rate,
    weekly: [],
    monthly: [],
  }
}
