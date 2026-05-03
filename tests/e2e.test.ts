import 'react-native'
process.env.TEST_MODE = 'true'
import { DBClient } from '../src/data/database'
import { Habit } from '../src/data/models/Habit'
import { Completion } from '../src/data/models/Completion'
import { HabitRepositoryImpl } from '../src/data/repositories/HabitRepositoryImpl'
import { CompletionRepositoryImpl } from '../src/data/repositories/CompletionRepositoryImpl'
import { calculateStreak } from '../src/domain/streaks'
import { generateId } from '../src/utils/uuid'

describe('End-to-End (Phase 7) Production Readiness (Memory DB path)', () => {
  test('CRUD flow + streak + export/import', async () => {
    await DBClient.init()
    // Create habit 1 (daily)
    const habitRepo = new HabitRepositoryImpl()
    const compRepo = new CompletionRepositoryImpl()
    const h: Habit = {
      id: 'e2e_daily_' + generateId(),
      title: 'End-to-End Daily',
      description: 'Test daily habit',
      type: 'daily',
      target: 1,
      color: '#111',
      icon: 'star',
      startDate: new Date().toISOString().slice(0, 10),
      reminderTime: null,
    }
    await habitRepo.createHabit(h)

    // Log completions for two consecutive days
    const d0 = new Date()
    const d1 = new Date(Date.now() - 24 * 3600 * 1000)
    const date0 = d0.toISOString().slice(0, 10)
    const date1 = d1.toISOString().slice(0, 10)
    await compRepo.addCompletion(h.id, date0, 1)
    await compRepo.addCompletion(h.id, date1, 1)
    const last30 = await compRepo.getCompletionsForHabit(h.id, date1, date0)
    const streak = calculateStreak(h, last30)
    expect(streak.currentStreak).toBeGreaterThanOrEqual(2)
    // Export data
    const { exportData, importData } = await import('../src/data/export-import')
    const json = await exportData()
    expect(typeof json).toBe('string')
    // Import data back (overwrite current DB) - should not throw
    await importData(json)
  }, 300000)
})
