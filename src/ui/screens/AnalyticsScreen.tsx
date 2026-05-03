import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/rootStore'
import { Habit } from '../../data/models/Habit'
import { Completion } from '../../data/models/Completion'
import { CompletionRepositoryImpl } from '../../data/repositories/CompletionRepositoryImpl'
import { computeAnalyticsForHabit, AnalyticsResult } from '../../domain/analytics'
import { calculateStreak } from '../../domain/streaks'
import { ProgressBar } from '../components/ProgressBar'

export const AnalyticsScreen: React.FC = () => {
  const habits = useSelector((state: RootState) => state.habits)
  const [stats, setStats] = useState<Array<{ habit: Habit; rate: number; today: number; currentStreak: number; longestStreak: number }>>([])

  useEffect(() => {
    let mounted = true
    (async () => {
      const repo = new CompletionRepositoryImpl()
      const now = new Date()
      const todayKey = now.toISOString().slice(0, 10)
      const startDate = new Date()
      startDate.setDate(now.getDate() - 29)
      const startKey = startDate.toISOString().slice(0, 10)
      const newStats: typeof stats = []
      for (const h of habits) {
        const todayComps = await repo.getCompletionsForHabit(h.id, todayKey, todayKey)
        const todayTotal = todayComps.reduce((a, c) => a + c.count, 0)
        const last30 = await repo.getCompletionsForHabit(h.id, startKey, todayKey)
        const total30 = last30.reduce((a, c) => a + c.count, 0)
        const rate = Math.round((total30 / (h.target * 30)) * 100)
        const streak = require('../../src/domain/streaks').calculateStreak(h, last30)
        newStats.push({ habit: h, rate, today: todayTotal, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak })
      }
      if (mounted) setStats(newStats)
    })()
    return () => { mounted = false }
  }, [habits.length])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      {stats.map(({ habit, rate, today, currentStreak, longestStreak }) => (
        <View key={habit.id} style={styles.card}>
          <Text style={styles.cardTitle}>{habit.title}</Text>
          <Text style={styles.meta}>Rate: {rate}% • Today: {today}/{habit.target}</Text>
          <View style={styles.row}>
            <Text style={styles.smallLabel}>Streak: {currentStreak} / {longestStreak}</Text>
            <View style={styles.chartWrapper}>
              <ProgressBar value={rate} max={100} />
            </View>
          </View>
        </View>
      ))}
      {habits.length === 0 && <Text style={styles.empty}>No habits to analytics yet.</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  card: { padding: 12, marginVertical: 6, borderRadius: 8, backgroundColor: '#111827' },
  cardTitle: { color: '#fff', fontSize: 16 },
  meta: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  smallLabel: { color: '#9ca3af', fontSize: 12 },
  chartWrapper: { width: '60%' },
  empty: { color: '#9ca3af', marginTop: 8 },
})


// End of analytics UI implementation (Phase 6+).
