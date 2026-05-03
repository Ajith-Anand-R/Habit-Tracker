import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native'
import { Habit } from '../../data/models/Habit'
import { HabitRepositoryImpl } from '../../data/repositories/HabitRepositoryImpl'
import { CompletionRepositoryImpl } from '../../data/repositories/CompletionRepositoryImpl'

type DayStatus = 'completed' | 'missed' | 'partial' | 'unknown'

type CalendarDate = {
  dateKey: string // YYYY-MM-DD
  date: Date
  inMonth: boolean
  status: DayStatus
}

export const CalendarScreen: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([])
  const [dateStatuses, setDateStatuses] = useState<Map<string, DayStatus>>(new Map())
  const [monthHabitStatuses, setMonthHabitStatuses] = useState<Map<string, Array<{habitId: string; status: DayStatus}>>>(new Map())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
const [modalVisible, setModalVisible] = useState(false)

  // Month navigation
  const today = new Date()
  const [displayYear, setDisplayYear] = useState<number>(today.getUTCFullYear())
  const [displayMonth, setDisplayMonth] = useState<number>(today.getUTCMonth()) // 0-based

  useEffect(() => {
    const repo = new HabitRepositoryImpl()
    repo.listHabits().then(setHabits)
  }, [])

  // Compute calendar grid for the displayed month
  const calendarGrid = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(displayYear, displayMonth, 1))
    const firstWeekday = firstOfMonth.getUTCDay() // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(Date.UTC(displayYear, displayMonth + 1, 0)).getUTCDate()
    // Previous month days to fill the grid
    const prevMonthDays = firstWeekday
    const totalCells = 6 * 7 // 42 cells
    const cells: CalendarDate[] = []
    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - prevMonthDays
      const dt = new Date(Date.UTC(displayYear, displayMonth, 1 + dayOffset))
      const dateKey = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
      const inMonth = dt.getUTCMonth() === displayMonth
      // initial status unknown; will lazy-load dynamically
      const status = dateStatuses.get(dateKey) ?? 'unknown'
      cells.push({ dateKey, date: dt, inMonth, status })
    }
    return cells
  }, [displayYear, displayMonth, dateStatuses])

  // Load statuses for the current month lazily
  useEffect(() => {
    // If we already loaded statuses for all days in this month, skip
    const needsLoad = calendarGrid.some(d => d.status === 'unknown')
    if (!needsLoad) return
    ;(async () => {
      const repoComp = new CompletionRepositoryImpl()
      const promises: Promise<void>[] = []
      const newStatus = new Map<string, DayStatus>(dateStatuses)
      for (let i = 0; i < calendarGrid.length; i++) {
        const cell = calendarGrid[i]
        const d = cell.date
        const dateKey = cell.dateKey
        // Build date in ISO yyyy-mm-dd in UTC
        const dateISO = dateKey
        // Determine per-habit status for this date
        const statusForDate = await computeDateStatus(habits, dateISO, repoComp)
        newStatus.set(dateKey, statusForDate)
      }
      setDateStatuses(newStatus)
    })()
  }, [calendarGrid.length, habits])

  // Load per-habit statuses for the current month to enrich calendar visuals
  useEffect(() => {
    let mounted = true
    if (!habits.length) return
    const repo = new CompletionRepositoryImpl()
    const promises = calendarGrid.map(async (cell) => {
      const dateKey = cell.dateKey
      const perHabit = await Promise.all(
        habits.map(async h => {
          const comps = await repo.getCompletionsForHabit(h.id, dateKey, dateKey)
          const sum = comps.reduce((a, c) => a + c.count, 0)
          const st: DayStatus = sum >= h.target ? 'completed' : sum > 0 ? 'partial' : 'missed'
          return { habitId: h.id, status: st }
        })
      )
      if (mounted) {
        monthHabitStatuses.set(dateKey, perHabit)
        // Trigger state update
        setMonthHabitStatuses(new Map(monthHabitStatuses))
      }
    })
    Promise.all(promises).catch(() => {})
    return () => { mounted = false }
  }, [habits, calendarGrid.length])

  async function computeDateStatus(allHabits: Habit[], dateISO: string, repoComp: CompletionRepositoryImpl): Promise<DayStatus> {
    if (allHabits.length === 0) return 'missed'
    // For each habit, fetch completions for this date
    const perHabitStatuses = await Promise.all(
      allHabits.map(async h => {
        const comps = await repoComp.getCompletionsForHabit(h.id, dateISO, dateISO)
        const sum = comps.reduce((a, c) => a + c.count, 0)
        return sum >= h.target ? 'completed' as DayStatus : sum > 0 ? 'partial' as DayStatus : 'missed' as DayStatus
      })
    )
    // Determine overall date status: completed only if all habits completed; partial if at least one completed but not all; else missed
    const allCompleted = perHabitStatuses.every(s => s === 'completed')
    const anyCompleted = perHabitStatuses.some(s => s === 'completed' || s === 'partial')
    if (allCompleted) return 'completed'
    if (anyCompleted) return 'partial'
    return 'missed'
  }

  const goPrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11)
      setDisplayYear(y => y - 1)
    } else {
      setDisplayMonth(m => m - 1)
    }
  }
  const goNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0)
      setDisplayYear(y => y + 1)
    } else {
      setDisplayMonth(m => m + 1)
    }
  }

  const renderCell = ({ item }: { item: CalendarDate }) => {
    const statusColor = item.status === 'completed' ? '#10b981' : item.status === 'partial' ? '#f59e0b' : item.status === 'missed' ? '#374151' : '#1f2937'
    const dayLabel = item.date.getUTCDate()
    const opacity = item.inMonth ? 1 : 0.3
    const statusesForDate = monthHabitStatuses.get(item.dateKey) ?? []
    return (
      <TouchableOpacity onPress={() => { setSelectedDate(item.dateKey); setModalVisible(true) }} style={[styles.cell, { opacity }]}>        
        <Text style={{ color: '#fff' }}>{dayLabel}</Text>
        <View style={[styles.indicator, { backgroundColor: statusColor }]} />
        <View style={styles.dotsRow}>
          {habits.slice(0, 4).map(h => {
            const s = statusesForDate.find(s => s.habitId === h.id)
            const dotColor = s?.status === 'completed' ? '#10b981' : s?.status === 'partial' ? '#f59e0b' : '#374151'
            return <View key={h.id} style={[styles.dot, { backgroundColor: dotColor }]} />
          })}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth}>
          <Text style={styles.nav}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayYear}-{String(displayMonth + 1).padStart(2, '0')}</Text>
        <TouchableOpacity onPress={goNextMonth}>
          <Text style={styles.nav}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekdayHeader}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <Text key={d} style={styles.weekday}>{d}</Text>
        ))}
      </View>
      <FlatList
        data={calendarGrid}
        keyExtractor={(d) => d.dateKey}
        numColumns={7}
        renderItem={renderCell}
      />
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Date: {selectedDate}</Text>
            <HabitStatusList dateISO={selectedDate ?? ''} habits={habits} navigationClose={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const HabitStatusList: React.FC<{ dateISO: string; habits: Habit[]; navigationClose: () => void }> = ({ dateISO, habits, navigationClose }) => {
  const [statuses, setStatuses] = useState<{ habit: Habit; status: DayStatus }[]>([])

  useEffect(() => {
    let mounted = true
    (async () => {
      if (!dateISO || !habits.length) return
      const repo = new CompletionRepositoryImpl()
      const list = await Promise.all(
        habits.map(async h => {
          const comps = await repo.getCompletionsForHabit(h.id, dateISO, dateISO)
          const sum = comps.reduce((a, c) => a + c.count, 0)
          const st: DayStatus = sum >= h.target ? 'completed' : sum > 0 ? 'partial' : 'missed'
          return { habit: h, status: st }
        })
      )
      if (mounted) setStatuses(list)
    })()
    return () => { mounted = false }
  }, [dateISO, habits])

  return (
    <View>
      {statuses.map(({ habit, status }) => (
        <View key={habit.id} style={styles.statusRow}>
          <Text style={styles.modalHabitName}>{habit.title}</Text>
          <View style={[styles.statusDot, status === 'completed' ? styles.completed : status === 'partial' ? styles.partial : styles.missed]} />
        </View>
      ))}
      <TouchableOpacity onPress={navigationClose} style={styles.closeBtn}><Text style={styles.closeBtnText}>Close</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { padding: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 16 },
  nav: { color: '#fff' },
  weekdayHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  weekday: { width: 40, textAlign: 'center', color: '#9ca3af' },
  cell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  dotsRow: {
    position: 'absolute', left: 6, bottom: 4,
    flexDirection: 'row'
  },
  dot: {
    width: 6, height: 6, borderRadius: 3, marginRight: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#0b0b0b',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  modalHabitName: { color: '#fff', fontSize: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  completed: { backgroundColor: '#10b981' },
  partial: { backgroundColor: '#f59e0b' },
  missed: { backgroundColor: '#374151' },
  closeBtn: { marginTop: 8, alignItems: 'center' },
  closeBtnText: { color: '#fff' },
})

export default CalendarScreen
