import { configureStore } from '@reduxjs/toolkit'
import habitsReducer from './features/habitsSlice'
import completionsReducer from './features/completionsSlice'

export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    completions: completionsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
