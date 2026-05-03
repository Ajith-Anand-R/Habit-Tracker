import { Completion } from '../models/Completion'
import { DBClient } from '../database'
import { CompletionRepository } from './CompletionRepository'

export class CompletionRepositoryImpl implements CompletionRepository {
  async addCompletion(habitId: string, date: string, count: number): Promise<void> {
    const id = generateId()
    await DBClient.run(`INSERT INTO completions (id, habitId, date, count) VALUES (?, ?, ?, ?)`, [id, habitId, date, count])
  }

  async getCompletionsForDate(date: string): Promise<Completion[]> {
    const rows = await DBClient.queryAll(`SELECT * FROM completions WHERE date = ?`, [date])
    return rows.map((r: any) => ({
      id: r.id,
      habitId: r.habitId,
      date: r.date,
      count: r.count,
    }))
  }

  async getCompletionsForHabit(habitId: string, startDate?: string, endDate?: string): Promise<Completion[]> {
    let sql = `SELECT * FROM completions WHERE habitId = ?`
    const params: any[] = [habitId]
    if (startDate) {
      sql += ' AND date >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND date <= ?'
      params.push(endDate)
    }
    const rows = await DBClient.queryAll(sql, params)
    return rows.map((r: any) => ({ id: r.id, habitId: r.habitId, date: r.date, count: r.count }))
  }

  async getTotalCompletionsForHabit(habitId: string, startDate?: string, endDate?: string): Promise<number> {
    let sql = `SELECT SUM(count) as total FROM completions WHERE habitId = ?`
    const params: any[] = [habitId]
    if (startDate) {
      sql += ' AND date >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND date <= ?'
      params.push(endDate)
    }
    const rows = await DBClient.queryAll(sql, params)
    const total = rows[0]?.total ?? 0
    return total
  }

  async incrementCompletionForDate(habitId: string, date: string): Promise<Completion> {
    const rows = await DBClient.queryAll(`SELECT id, count FROM completions WHERE habitId = ? AND date = ? LIMIT 1`, [habitId, date])
    if (rows.length > 0) {
      const row = rows[0]
      const newCount = (row.count ?? 0) + 1
      await DBClient.run(`UPDATE completions SET count = ? WHERE id = ?`, [newCount, row.id])
      return { id: row.id, habitId, date, count: newCount } as Completion
    } else {
      const id = generateId()
      await DBClient.run(`INSERT INTO completions (id, habitId, date, count) VALUES (?, ?, ?, ?)`, [id, habitId, date, 1])
      return { id, habitId, date, count: 1 } as Completion
    }
  }

  async getAllCompletions(): Promise<Completion[]> {
    const rows = await DBClient.queryAll(`SELECT * FROM completions`, [])
    return rows.map((r: any) => ({ id: r.id, habitId: r.habitId, date: r.date, count: r.count }))
  }
}
