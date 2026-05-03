import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  date: string
  status?: 'completed' | 'missed' | 'partial'
}

export const CalendarCell: React.FC<Props> = ({ date, status }) => {
  return (
    <View style={[styles.cell, status === 'completed' && styles.completed, status === 'missed' && styles.missed]}>
      <Text style={styles.date}>{date}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: {
    backgroundColor: '#10b981',
  },
  missed: {
    backgroundColor: '#374151',
  },
  date: {
    fontSize: 10,
    color: '#fff',
  },
})
