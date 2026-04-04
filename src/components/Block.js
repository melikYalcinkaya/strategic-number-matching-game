import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NUMBER_COLORS } from '../utils/constants';

export default function Block({ value, size, onPress, selected, selectionOrder }) {
  const bgColor = NUMBER_COLORS[value];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.block,
        { width: size, height: size, backgroundColor: bgColor, borderRadius: 6 },
        selected && styles.selected,
      ]}
    >
      <Text style={[styles.number, { fontSize: size * 0.38 }]}>{value}</Text>
      {selected && selectionOrder != null && (
        <Text style={[styles.order, { fontSize: size * 0.22 }]}>{selectionOrder}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: 'white',
    transform: [{ scale: 1.06 }],
  },
  number: {
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  order: {
    position: 'absolute',
    top: 2,
    right: 3,
    fontWeight: 'bold',
    color: 'white',
  },
});
