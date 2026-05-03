import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Completion } from '../../data/models/Completion'
import { CompletionRepositoryImpl } from '../../data/repositories/CompletionRepositoryImpl'

type CompletionsState = Completion[]
const initialState: CompletionsState = []

const completionsSlice = createSlice({
  name: 'completions',
  initialState,
  reducers: {
    addCompletion(state, action: PayloadAction<Completion>) {
      state.push(action.payload)
    },
    setCompletionsForDate(state, action: PayloadAction<Completion[]>) {
      // For skeleton, replace whole list (phase 2 will refine)
      return action.payload
    },
    setCompletionsForHabit(
      state,
      action: PayloadAction<{ habitId: string; completions: Completion[] }>
    ) {
      // Placeholder: replace completions for the given habit (simplified)
      const { habitId, completions } = action.payload
      const rest = state.filter(c => c.habitId !== habitId)
      rest.push(...completions)
      // Mutate in-place for Immer compatibility
      state.splice(0, state.length, ...rest)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(completeToday.fulfilled, (state, action) => {
      const c = action.payload
      const idx = state.findIndex(x => x.habitId === c.habitId && x.date === c.date)
      if (idx >= 0) {
        state[idx] = c
      } else {
        state.push(c)
      }
    })
  }
})

export default completionsSlice.reducer
export const { addCompletion, setCompletionsForDate, setCompletionsForHabit } = completionsSlice.actions
export const completeToday = createAsyncThunk('completions/completeToday', async (habitId: string): Promise<Completion> => {
  const repo = new CompletionRepositoryImpl()
  const today = new Date().toISOString().slice(0, 10)
  const result = await repo.incrementCompletionForDate(habitId, today)
  return result
})
