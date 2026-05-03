import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'

type Props = {
  onPress?: () => void
  label?: string
  testID?: string
}

export const Fab: React.FC<Props> = ({ onPress, label = '+', testID }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.fab} testID={testID}>
      <View style={styles.inner}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
})
