import React, { useMemo, useState } from 'react'
import { View, Text, Button, StyleSheet, TextInput, ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { deleteHabitAsync, updateHabitAsync } from '../../store/features/habitsSlice'
import { completeToday } from '../../store/features/completionsSlice'
import type { RootState } from '../../store/rootStore'

type Props = { route?: any; navigation?: any }
export const HabitDetailScreen: React.FC<Props> = ({ route }) => {
  const habitId = route?.params?.habitId
  const dispatch = useDispatch()
  const habit = useSelector((state: RootState) => state.habits.find(h => h.id === habitId) || null)

  // Inline editing state
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState<any>(null)

  // Initialize local copy when editing begins
  function beginEdit() {
    if (habit) {
      setLocal({ ...habit })
      setEditing(true)
    }
  }

  function onSave() {
    if (local) {
      dispatch(updateHabitAsync(local))
      setEditing(false)
    }
  }

  if (!habit) {
    return (
      <View>
        <Text>Habit not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {!editing ? (
        <View>
          <Text style={styles.title}>{habit.title}</Text>
          <Text style={styles.meta}>Type: {habit.type} • Target: {habit.target}</Text>
          <Text style={styles.meta}>Description: {habit.description || '(none)'}</Text>
          <Text style={styles.meta}>Start Date: {habit.startDate}</Text>
          {habit.reminderTime ? <Text style={styles.meta}>Reminder: {habit.reminderTime}</Text> : null}
          <View style={styles.row}>
            <Button title="Edit" onPress={beginEdit} />
            <Button title="Delete" onPress={() => dispatch(deleteHabitAsync(habit.id))} />
            <Button title="Complete Today" onPress={() => dispatch(completeToday(habit.id))} />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Edit Habit</Text>
          <TextInput style={styles.input} value={local?.title ?? ''} onChangeText={(v) => setLocal({ ...local, title: v })} placeholder="Title" />
          <TextInput style={styles.input} value={local?.description ?? ''} onChangeText={(v) => setLocal({ ...local, description: v })} placeholder="Description" multiline />
          <TextInput style={styles.input} value={local?.type ?? habit.type} onChangeText={(v) => setLocal({ ...local, type: v as any })} placeholder="Type (daily/weekly/custom)" />
          <TextInput style={styles.input} value={String(local?.target ?? habit.target)} onChangeText={(v) => setLocal({ ...local, target: parseInt(v || '0', 10) || 0 })} keyboardType="numeric" placeholder="Target" />
          <TextInput style={styles.input} value={local?.color ?? habit.color} onChangeText={(v) => setLocal({ ...local, color: v })} placeholder="Color" />
          <TextInput style={styles.input} value={local?.icon ?? habit.icon} onChangeText={(v) => setLocal({ ...local, icon: v })} placeholder="Icon" />
          <TextInput style={styles.input} value={local?.startDate ?? habit.startDate} onChangeText={(v) => setLocal({ ...local, startDate: v })} placeholder="Start Date (YYYY-MM-DD)" />
          <TextInput style={styles.input} value={local?.reminderTime ?? habit.reminderTime ?? ''} onChangeText={(v) => setLocal({ ...local, reminderTime: v })} placeholder="Reminder Time (HH:MM)" />
          <View style={styles.row}>
            <Button title="Save" onPress={onSave} />
            <Button title="Cancel" onPress={() => setEditing(false)} />
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 6 },
  meta: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  input: {
    height: 40,
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: '#fff',
    backgroundColor: '#111',
    marginTop: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
})
