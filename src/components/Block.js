import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NUMBER_COLORS } from '../utils/constants';

export default function Block({ value, size }) {
  const bgColor = NUMBER_COLORS[value];

  return (
    <View style={[styles.block, { width: size, height: size, backgroundColor: bgColor }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});
