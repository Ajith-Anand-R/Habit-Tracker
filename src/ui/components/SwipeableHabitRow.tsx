import React, { useRef, useState } from 'react'
import { Animated, PanResponder, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { Habit } from '../../data/models/Habit'

type Props = {
  habit: Habit
  onComplete: () => void
  onEdit: () => void
  onDelete: () => void
  children?: React.ReactNode
}

export const SwipeableHabitRow: React.FC<Props> = ({ habit, onComplete, onEdit, onDelete, children }) => {
  const panX = useRef(new Animated.Value(0)).current
  const [revealed, setRevealed] = useState<'left'|'right'|null>(null)

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 8,
      onPanResponderMove: (_, gestureState) => {
        // Move the item horizontally with touch
        const dx = gestureState.dx
        // Constrain to -200..200
        const clamped = Math.max(-200, Math.min(200, dx))
        panX.setValue(clamped)
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped beyond threshold, reveal actions
        if (gestureState.dx > 100) {
          setRevealed('right')
          Animated.timing(panX, { toValue: 120, duration: 120, useNativeDriver: true }).start()
        } else if (gestureState.dx < -100) {
          setRevealed('left')
          Animated.timing(panX, { toValue: -120, duration: 120, useNativeDriver: true }).start()
        } else {
          // Snap back
          Animated.timing(panX, { toValue: 0, duration: 120, useNativeDriver: true }).start()
          setRevealed(null)
        }
      }
    })
  ).current

  const translate = { transform: [{ translateX: panX }] as any }

  return (
    <View style={styles.container}>
      {/* Left actions (Edit / Delete) */}
      <View style={styles.actionsLeft}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.row, translate]} {...panResponder.panHandlers}>
        <View style={styles.bubbleContent}>
          {children}
        </View>
        {/* Right action (Complete) */}
        <View style={styles.actionsRight}>
          <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
            <Text style={styles.completeText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    marginVertical: 6,
  },
  actionsLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 120,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8,
    backgroundColor: '#1f2937', borderRadius: 8,
  },
  actionsRight: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 120, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 8,
  },
  actionBtn: { backgroundColor: '#374151', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, marginHorizontal: 2 },
  actionText: { color: '#fff' },
  completeBtn: { backgroundColor: '#3b82f6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  completeText: { color: '#fff' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, backgroundColor: '#111827', borderRadius: 8, height: 72
  },
  bubbleContent: { flex: 1 },
  bubble: { padding: 8 },
  title: { color: '#fff' },
  modalBackdrop: {},
})
