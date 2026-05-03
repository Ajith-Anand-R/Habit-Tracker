import React, { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Habit } from '../../data/models/Habit'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store/rootStore'
import { createHabit } from '../../store/features/habitsSlice'
import { generateId } from '../../utils/uuid'

// Minimal dark-mode-friendly form for creating a habit
export const HabitFormScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [target, setTarget] = useState<string>('1')
  const [color, setColor] = useState<string>('#374151')
  const [icon, setIcon] = useState<string>('star')
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [reminderTime, setReminderTime] = useState<string>('')

  // Options (minimal predefined sets)
  const typeOptions: Array<'daily' | 'weekly' | 'custom'> = ['daily', 'weekly', 'custom']
  const colorOptions: string[] = ['#111827', '#374151', '#4b5563', '#64748b', '#334155']
  const iconOptions: string[] = ['star', 'check', 'bell', 'heart', 'fire']

  const onSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required')
      return
    }
    const t = parseInt(target, 10)
    if (Number.isNaN(t) || t <= 0) {
      Alert.alert('Validation', 'Target must be a positive number')
      return
    }
    const habit: Habit = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      type,
      target: t,
      color,
      icon,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      reminderTime: reminderTime?.trim() || null,
    }
    dispatch(createHabit(habit))
    // Reset form (optional) and inform user
    setTitle('')
    setDescription('')
    setTarget('1')
    setReminderTime('')
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>New Habit</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.section}>Type</Text>
      <View style={styles.row as any}>
        {typeOptions.map((op) => (
          <TouchableOpacity key={op} onPress={() => setType(op)} style={[styles.pill, type === op && styles.pillSelected]}>
            <Text style={styles.pillText}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.section}>Target</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={target} onChangeText={setTarget} />
      <Text style={styles.section}>Color</Text>
      <View style={styles.row}>
        {colorOptions.map((c) => (
          <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorSwatch, { backgroundColor: c }, color === c && styles.colorSelected]} />
        ))}
      </View>
      <Text style={styles.section}>Icon</Text>
      <View style={styles.row}>
        {iconOptions.map((it) => (
          <TouchableOpacity key={it} onPress={() => setIcon(it)} style={[styles.iconOption, icon === it && styles.iconSelected]}>
            <Text style={styles.iconText}>{it}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.section}>Start Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
      <Text style={styles.section}>Reminder Time (optional)</Text>
      <TextInput style={styles.input} placeholder="HH:MM" value={reminderTime} onChangeText={setReminderTime} />
      <TouchableOpacity onPress={onSubmit} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Save Habit</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  section: { marginTop: 12, color: '#e5e7eb' },
  input: {
    height: 40,
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: '#fff',
    backgroundColor: '#111',
  },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
    marginTop: 6,
  },
  pillSelected: {
    backgroundColor: '#374151',
  },
  pillText: { color: '#fff' },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#fff',
  },
  iconOption: {
    padding: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#1f2937',
  },
  iconSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconText: { color: '#fff' },
  saveBtn: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
})
