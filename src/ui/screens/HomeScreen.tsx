import React, { useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/rootStore'
import { useDispatch } from 'react-redux'
import { completeToday } from '../../store/features/completionsSlice'
import { SwipeableHabitRow } from '../components/SwipeableHabitRow'
import { deleteHabitAsync } from '../../store/features/habitsSlice'
import { generateId } from '../../utils/uuid'
import { Habit } from '../../data/models/Habit'
import { createHabit } from '../../store/features/habitsSlice'
import { HabitFormScreen } from './HabitFormScreen'
import { Fab } from '../components/Fab'

export const HomeScreen: React.FC = () => {
  const habits = useSelector((state: RootState) => state.habits)
  const dispatch = useDispatch()
  const [showInlineForm, setShowInlineForm] = useState(false)
  // Inline form state for quick add (inline form will use the same Habit shape)
  const [inlineTitle, setInlineTitle] = useState('')
  const [inlineDescription, setInlineDescription] = useState('')
  const [inlineType, setInlineType] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [inlineTarget, setInlineTarget] = useState<string>('1')
  const [inlineColor, setInlineColor] = useState<string>('#374151')
  const [inlineIcon, setInlineIcon] = useState<string>('star')
  const [inlineStartDate, setInlineStartDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [inlineReminder, setInlineReminder] = useState<string>('')

  const addInlineHabit = () => {
    if (!inlineTitle.trim()) return
    const habit: Habit = {
      id: generateId(),
      title: inlineTitle.trim(),
      description: inlineDescription.trim(),
      type: inlineType,
      target: parseInt(inlineTarget, 10) || 1,
      color: inlineColor,
      icon: inlineIcon,
      startDate: inlineStartDate,
      reminderTime: inlineReminder?.trim() || null,
    }
    dispatch(createHabit(habit))
    // reset
    setInlineTitle('')
    setInlineDescription('')
    setInlineTarget('1')
    setInlineReminder('')
    setShowInlineForm(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habits</Text>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableHabitRow
            habit={item}
            onComplete={() => dispatch(completeToday(item.id))}
            onEdit={() => { /* Phase 6: navigation to HabitFormScreen with habitId can be implemented later */ }}
            onDelete={() => dispatch(deleteHabitAsync(item.id))}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>Type: {item.type} • Target: {item.target}</Text>
          </SwipeableHabitRow>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No habits yet. Add one with the + FAB.</Text>}
      />
      <Fab testID="fab-add" onPress={() => setShowInlineForm(v => !v)} label="+" />
      {showInlineForm && (
        <View style={styles.inlineForm}>
          <TextInput testID="inline-title" placeholder="Habit title" value={inlineTitle} onChangeText={setInlineTitle} style={styles.input} />
          <TextInput testID="inline-desc" placeholder="Description" value={inlineDescription} onChangeText={setInlineDescription} style={styles.input} multiline />
          <TextInput testID="inline-target" placeholder="Target" value={inlineTarget} onChangeText={setInlineTarget} style={styles.input} keyboardType="numeric" />
          <TextInput testID="inline-color" placeholder="Color" value={inlineColor} onChangeText={setInlineColor} style={styles.input} />
          <TextInput testID="inline-icon" placeholder="Icon" value={inlineIcon} onChangeText={setInlineIcon} style={styles.input} />
          <TextInput testID="inline-startdate" placeholder="Start Date (YYYY-MM-DD)" value={inlineStartDate} onChangeText={setInlineStartDate} style={styles.input} />
          <TextInput testID="inline-reminder" placeholder="Reminder Time (HH:MM)" value={inlineReminder} onChangeText={setInlineReminder} style={styles.input} />
          <View style={styles.row}>
            <Button testID="inline-save" title="Save Habit" onPress={addInlineHabit} />
            <Button title="Cancel" onPress={() => setShowInlineForm(false)} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  card: { padding: 12, marginVertical: 6, borderRadius: 8, backgroundColor: '#111827' },
  cardTitle: { color: '#fff', fontSize: 16 },
  meta: { color: '#9ca3af', fontSize: 12 },
  empty: { color: '#9ca3af', marginTop: 8 },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 },
  completeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#374151' },
  completeBtnText: { color: '#fff' },
  // Layout helpers for the swipe component (kept simple)
  swipeRow: { height: 72, marginVertical: 6 },
})
