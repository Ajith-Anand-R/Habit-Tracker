import React from 'react'
import { View, StyleSheet } from 'react-native'

type Props = {
  value: number
  max?: number
}

export const ProgressBar: React.FC<Props> = ({ value, max = 100 }) => {
  const ratio = Math.max(0, Math.min(1, value / max))
  return (
    <View style={styles.wrapper}>
      <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: 8,
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
})
