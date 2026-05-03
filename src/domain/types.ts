export type HabitType = 'daily' | 'weekly' | 'custom'

export interface HabitDomain {
  id: string
  title: string
  description: string
  type: HabitType
  target: number
  color: string
  icon: string
  startDate: string // ISO date (UTC)
  reminderTime?: string | null
}

export interface CompletionDomain {
  id: string
  habitId: string
  date: string // ISO date
  count: number
}
