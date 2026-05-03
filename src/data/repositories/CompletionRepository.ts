import type { Completion } from '../models/Completion'

export interface CompletionRepository {
  addCompletion(habitId: string, date: string, count: number): Promise<void>
  getCompletionsForDate(date: string): Promise<Completion[]>
  getCompletionsForHabit(habitId: string, startDate?: string, endDate?: string): Promise<Completion[]>
  getTotalCompletionsForHabit(habitId: string, startDate?: string, endDate?: string): Promise<number>
  incrementCompletionForDate(habitId: string, date: string): Promise<Completion>
  getAllCompletions(): Promise<Completion[]>
}
