import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  name: string
  color?: string
}

export const Icon: React.FC<Props> = ({ name, color = '#fff' }) => {
  return (
    <View style={styles.icon}>
      <Text style={{ color }}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
