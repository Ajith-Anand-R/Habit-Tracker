import * as Notifications from 'expo-notifications'
import type { Habit } from './data/models/Habit'
import { Platform } from 'react-native'

type ReminderHandle = string

export async function ensurePermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  if (status === Notifications.AuthorizationStatus.NOT_DETERMINED) {
    const { status: req } = await Notifications.requestPermissionsAsync()
    return req === Notifications.AuthorizationStatus.AUTHORIZED || req === Notifications.AuthorizationStatus.DENIED
  }
  return status === Notifications.AuthorizationStatus.AUTHORIZED
}

export async function scheduleReminderForHabit(habit: Habit): Promise<ReminderHandle | null> {
  if (!habit.reminderTime) return null
  if (Platform.OS === 'web') return null
  const [hh, mm] = habit.reminderTime.split(':').map(n => parseInt(n, 10))
  const trigger: any = {
    hour: hh,
    minute: mm,
    repeats: true,
  }
  const id = `habit_reminder_${habit.id}`
  await ensurePermissions()
  try {
    const res = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Reminder',
        body: `${habit.title} - time to act!`,
      },
      trigger,
      id,
    } as any)
    return id
  } catch (e) {
    return null
  }
}

export async function scheduleRemindersForAllHabits(habits: Habit[]): Promise<void> {
  for (const h of habits) {
    await scheduleReminderForHabit(h)
  }
}
