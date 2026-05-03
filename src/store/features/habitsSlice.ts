import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Habit } from '../../data/models/Habit'
import { HabitRepositoryImpl } from '../../data/repositories/HabitRepositoryImpl'
import { generateId } from '../../utils/uuid'

type HabitsState = Habit[]

const initialState: HabitsState = []

// Async thunks wired to real DB layer (Phase 2 integration)
export const loadHabits = createAsyncThunk('habits/load', async (): Promise<Habit[]> => {
  const repo = new HabitRepositoryImpl()
  return await repo.listHabits()
})

// Create a new habit
export const createHabit = createAsyncThunk('habits/create', async (habit: Habit): Promise<Habit> => {
  const repo = new HabitRepositoryImpl()
  await repo.createHabit(habit)
  return habit
})

// Update existing habit
export const updateHabitAsync = createAsyncThunk('habits/update', async (habit: Habit): Promise<Habit> => {
  const repo = new HabitRepositoryImpl()
  await repo.updateHabit(habit)
  return habit
})

// Delete habit by id
export const deleteHabitAsync = createAsyncThunk('habits/delete', async (id: string): Promise<string> => {
  const repo = new HabitRepositoryImpl()
  await repo.deleteHabit(id)
  return id
})

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setHabits(state, action: PayloadAction<Habit[]>) {
      return action.payload
    },
    addHabit(state, action: PayloadAction<Habit>) {
      state.push(action.payload)
    },
    updateHabit(state, action: PayloadAction<Habit>) {
      const idx = state.findIndex(h => h.id === action.payload.id)
      if (idx >= 0) state[idx] = action.payload
    },
    deleteHabit(state, action: PayloadAction<string>) {
      return state.filter(h => h.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadHabits.fulfilled, (state, action) => {
      return action.payload
    })
    builder.addCase(createHabit.fulfilled, (state, action) => {
      state.push(action.payload)
    })
    builder.addCase(updateHabitAsync.fulfilled, (state, action) => {
      const idx = state.findIndex(h => h.id === action.payload.id)
      if (idx >= 0) state[idx] = action.payload
    })
    builder.addCase(deleteHabitAsync.fulfilled, (state, action) => {
      return state.filter(h => h.id !== action.payload)
    })
  }
})

export default habitsSlice.reducer
export const { setHabits, addHabit, updateHabit, deleteHabit } = habitsSlice.actions
export { loadHabits, createHabit, updateHabitAsync, deleteHabitAsync }
