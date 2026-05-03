import { Habit } from '../models/Habit'
import { DBClient } from '../database'
import { HabitRepository } from './HabitRepository'


export class HabitRepositoryImpl implements HabitRepository {
  async createHabit(habit: Habit): Promise<void> {
    await DBClient.run(
      `INSERT INTO habits (id, title, description, type, target, color, icon, startDate, reminderTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [habit.id, habit.title, habit.description, habit.type, habit.target, habit.color, habit.icon, habit.startDate, habit.reminderTime]
    )
  }

  async getHabitById(id: string): Promise<Habit | null> {
    const rows = await DBClient.queryAll(`SELECT * FROM habits WHERE id = ?`, [id])
    if (rows.length === 0) return null
    const r = rows[0]
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      target: r.target,
      color: r.color,
      icon: r.icon,
      startDate: r.startDate,
      reminderTime: r.reminderTime,
    }
  }

  async updateHabit(habit: Habit): Promise<void> {
    await DBClient.run(
      `UPDATE habits SET title = ?, description = ?, type = ?, target = ?, color = ?, icon = ?, startDate = ?, reminderTime = ? WHERE id = ?`,
      [habit.title, habit.description, habit.type, habit.target, habit.color, habit.icon, habit.startDate, habit.reminderTime, habit.id]
    )
  }

  async deleteHabit(id: string): Promise<void> {
    await DBClient.run(`DELETE FROM habits WHERE id = ?`, [id])
  }

  async listHabits(): Promise<Habit[]> {
    const rows = await DBClient.queryAll(`SELECT * FROM habits`, [])
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      target: r.target,
      color: r.color,
      icon: r.icon,
      startDate: r.startDate,
      reminderTime: r.reminderTime,
    }))
  }
}
