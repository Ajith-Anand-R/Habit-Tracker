import React, { useEffect } from 'react'
import { SafeAreaView, Text } from 'react-native'
import { Provider } from 'react-redux'
import { store } from './store/rootStore'
import { loadHabits } from './store/features/habitsSlice'
import { scheduleRemindersForAllHabits } from './notifications'
import { useSelector } from 'react-redux'
import { DBClient } from './data/database'
import type { AppDispatch } from './store/rootStore'
import { useDispatch } from 'react-redux'

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const allHabits = useSelector((state: any) => state.habits)
  useEffect(() => {
    ;(async () => {
      try {
        await DBClient.init()
        dispatch(loadHabits())
        // Schedule reminders for all habits after loading (best-effort)
        scheduleRemindersForAllHabits && scheduleRemindersForAllHabits(allHabits?.length ? allHabits : [])
      } catch (e) {
        console.error('DB initialization failed', e)
      }
    })()
  }, [])
  useEffect(() => {
    // Schedule reminders whenever habits list updates (production-ready phase)
    scheduleRemindersForAllHabits && scheduleRemindersForAllHabits(allHabits ?? [])
  }, [allHabits])
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff' }}>Habit Tracker Skeleton</Text>
    </SafeAreaView>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
