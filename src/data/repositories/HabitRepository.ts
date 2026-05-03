import type { Habit } from '../models/Habit'

export interface HabitRepository {
  createHabit(habit: Habit): Promise<void>
  getHabitById(id: string): Promise<Habit | null>
  updateHabit(habit: Habit): Promise<void>
  deleteHabit(id: string): Promise<void>
  listHabits(): Promise<Habit[]>
}
