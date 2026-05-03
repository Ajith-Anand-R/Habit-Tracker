import * as SQLite from 'expo-sqlite'
import type { Habit } from './models/Habit'
import type { Completion } from './models/Completion'
import { generateId } from '../utils/uuid'

// SQLite-backed DB client (Phase 2 concrete implementation)
export class DBClient {
  private static db: SQLite.WebSQLDatabase | null = null
  // In-memory test mode data stores (Phase 7+ end-to-end could reuse this path)
  private static memoryHabits: Habit[] = []
  private static memoryCompletions: Completion[] = []

  private static testMode(): boolean {
    return process.env.TEST_MODE === 'true'
  }

  static getDB(): any {
    if (this.testMode()) {
      // Return a lightweight stub with a transaction method to handle in-memory ops
      const self = this
      return {
        transaction: (cb: (tx: any) => void, _err?: (e: any) => void, _success?: () => void) => {
          const tx = {
            executeSql: (sql: string, params: any[], success?: (t: any, result: any) => void, failure?: (_t: any, _e: any) => void) => {
              // Very lightweight SQL-like dispatch for mem-only path
              const s = sql.trim().toUpperCase()
              try {
                // Habits table
                if (s.startsWith('INSERT INTO HABITS')) {
                  const [id, title, description, type, target, color, icon, startDate, reminderTime] = params
                  self.memoryHabits.push({ id, title, description, type, target: Number(target), color, icon, startDate, reminderTime })
                  success && success(null, { rows: { _array: [], length: 0 } })
                  return
                }
                if (s.startsWith('SELECT * FROM HABITS') && !s.includes('WHERE')) {
                  const rows = self.memoryHabits.map(h => ({ ...h }))
                  const res = { rows: { length: rows.length, _array: rows }, rowsAffected: 0 }
                  success && success(null, res)
                  return
                }
                if (s.startsWith('SELECT * FROM HABITS') && s.includes('WHERE')) {
                  const id = params[0]
                  const found = self.memoryHabits.find(h => h.id === id) || null
                  const rows = found ? [found] : []
                  const res = { rows: { length: rows.length, _array: rows }, rowsAffected: 0 }
                  success && success(null, res)
                  return
                }
                if (s.startsWith('UPDATE HABITS')) {
                  const [title, description, type, target, color, icon, startDate, reminderTime, id] = params
                  const idx = self.memoryHabits.findIndex(h => h.id === id)
                  if (idx >= 0) {
                    self.memoryHabits[idx] = { id, title, description, type, target: Number(target), color, icon, startDate, reminderTime }
                  }
                  success && success(null, { rows: { _array: [], length: 0 } })
                  return
                }
                if (s.startsWith('DELETE FROM HABITS')) {
                  const id = params[0]
                  self.memoryHabits = self.memoryHabits.filter(h => h.id !== id)
                  success && success(null, { rows: { _array: [], length: 0 } })
                  return
                }
                // Completions
                if (s.startsWith('INSERT INTO COMPLETIONS')) {
                  const [id, habitId, date, count] = params
                  self.memoryCompletions.push({ id, habitId, date, count: Number(count) })
                  success && success(null, { rows: { _array: [], length: 0 } })
                  return
                }
                if (s.startsWith('SELECT * FROM COMPLETIONS') && !s.includes('WHERE')) {
                  const rows = self.memoryCompletions.map(c => ({ ...c }))
                  const res = { rows: { length: rows.length, _array: rows }, rowsAffected: 0 }
                  success && success(null, res)
                  return
                }
                if (s.startsWith('SELECT * FROM COMPLETIONS') && s.includes('WHERE') && s.includes('date = ?')) {
                  const date = params[0]
                  const rows = self.memoryCompletions.filter(c => c.date === date)
                  const res = { rows: { length: rows.length, _array: rows }, rowsAffected: 0 }
                  success && success(null, res)
                  return
                }
                if (s.startsWith('SELECT * FROM COMPLETIONS') && s.includes('WHERE') && s.includes('habitId =') && s.includes('date =')) {
                  const habitId = params[0]
                  const date = params[1]
                  const rows = self.memoryCompletions.filter(c => c.habitId === habitId && c.date === date)
                  const res = { rows: { length: rows.length, _array: rows }, rowsAffected: 0 }
                  success && success(null, res)
                  return
                }
                if (s.startsWith('SELECT SUM(count) as total FROM COMPLETIONS')) {
                  const habitId = params[0]
                  let total = 0
                  let startDate: string | undefined
                  let endDate: string | undefined
                  // Optional range support
                  if (params.length > 1) startDate = params[1]
                  if (params.length > 2) endDate = params[2]
                  for (const c of self.memoryCompletions) {
                    if (c.habitId !== habitId) continue
                    if (startDate && c.date < startDate) continue
                    if (endDate && c.date > endDate) continue
                    total += c.count
                  }
                  success && success(null, { rows: { _array: [{ total }] }, rowsAffected: 1 })
                  return
                }
              } catch (e) {
                failure && failure(null, e)
              }
            },
          }
        },
        _err: (e: any) => {
          // ignore
        },
      }
    }
    return this.db
  }

  static async init(): Promise<void> {
    const db = this.getDB()
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Habits table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            target INTEGER NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL,
            startDate TEXT NOT NULL,
            reminderTime TEXT
          )`,
          [],
          () => { /* ok */ },
          (_, err) => { reject(err); return false; }
        )
        // Completions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS completions (
            id TEXT PRIMARY KEY,
            habitId TEXT NOT NULL,
            date TEXT NOT NULL,
            count INTEGER NOT NULL,
            FOREIGN KEY (habitId) REFERENCES habits(id)
          )`,
          [],
          () => { /* ok */ },
          (_, err) => { reject(err); return false; }
        )
        // Indexes
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_completion_habit_date ON completions (habitId, date)`,
          [],
          () => { /* ok */ },
          (_, err) => { reject(err); return false; }
        )
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_completion_date ON completions (date)`,
          [],
          () => { /* ok */ },
          (_, err) => { reject(err); return false; }
        )
      }, (err) => reject(err), () => resolve())
    })
  }

  static async run(sql: string, params: any[] = []): Promise<{ rows: any[]; rowsAffected?: number; insertId?: any }> {
    const db = this.getDB()
    // In test mode, the 'db' is a memory shim; executeSql is invoked synchronously
    return new Promise((resolve, reject) => {
      try {
        db.transaction((tx: any) => {
          // Use the same executeSql interface as production path
          tx.executeSql(sql, params, (_t: any, result: any) => {
            const rows = (result?.rows?.length ? (result.rows._array ?? []) : []) as any[]
            resolve({ rows, rowsAffected: result?.rowsAffected, insertId: result?.insertId })
          }, (_t: any, error: any) => {
            reject(error)
            return false
          })
        }, (err: any) => reject(err))
      } catch (e) {
        reject(e)
      }
    })
  }

  static async queryAll(sql: string, params: any[] = []): Promise<any[]> {
    const res = await this.run(sql, params)
    return res.rows ?? []
  }
}
