import { Habit } from '../src/data/models/Habit'
import { Completion } from '../src/data/models/Completion'
import { DBClient } from '../src/data/database'
import { HabitRepositoryImpl } from '../src/data/repositories/HabitRepositoryImpl'
import { CompletionRepositoryImpl } from '../src/data/repositories/CompletionRepositoryImpl'

describe('repository layer (SQLite-backed)', () => {
  test('basic CRUD surfaces exist and can be called', async () => {
    await DBClient.init()
    const habitRepo = new HabitRepositoryImpl()
    const compRepo = new CompletionRepositoryImpl()
    // Create a habit
    const habit: Habit = {
      id: 'test_habit',
      title: 'Repo Test',
      description: '',
      type: 'daily',
      target: 1,
      color: '#000',
      icon: 'star',
      startDate: new Date().toISOString(),
      reminderTime: null,
    }
    await habitRepo.createHabit(habit)
    const list = await habitRepo.listHabits()
    expect(list.find(h => h.id === habit.id)).toBeTruthy()
    // Add a completion
    const date = new Date().toISOString().slice(0, 10)
    await compRepo.addCompletion(habit.id, date, 1)
    const comps = await compRepo.getCompletionsForDate(date)
    expect(comps.length).toBeGreaterThan(0)
  })
})
