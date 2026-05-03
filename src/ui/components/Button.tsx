import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

type Props = {
  onPress?: () => void
  title: string
  testID?: string
}

export const Button: React.FC<Props> = ({ onPress, title, testID }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} testID={testID}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
})
