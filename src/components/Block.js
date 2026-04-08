import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NUMBER_COLORS } from '../utils/constants';

// Block: tek bir ızgara hücresini temsil eder
// exploding=true → scale+opacity 1→0 animasyonu 200ms içinde kaybolur böylece
// fallAnim     → yerçekimi translateY animasyonu için Grid'den gelir
export default function Block({ value, size, onPress, selected, selectionOrder, exploding, fallAnim }) {
  const bgColor = NUMBER_COLORS[value];

  // Patlama animasyonu için değerler
  const explosionScale   = useRef(new Animated.Value(1)).current;
  const explosionOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (exploding) {
      // Patlama: ölçek ve saydamlık 1 → 0 (200ms)
      explosionScale.setValue(1);
      explosionOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(explosionScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(explosionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animasyon bitti ya da henüz başlamadı; değerleri sıfırla
      explosionScale.setValue(1);
      explosionOpacity.setValue(1);
    }
  }, [exploding, explosionScale, explosionOpacity]);

  // Transform dizisi: önce düşme (fallAnim), sonra patlama ölçeği
  const transforms = [];
  if (fallAnim) transforms.push({ translateY: fallAnim });
  if (exploding) transforms.push({ scale: explosionScale });

  return (
    <Animated.View
      style={[
        transforms.length > 0 && { transform: transforms },
        { opacity: exploding ? explosionOpacity : 1 },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        disabled={exploding} // patlama sırasında seçim yasak
        style={[
          styles.block,
          { width: size, height: size, backgroundColor: bgColor, borderRadius: 6 },
          selected && !exploding && styles.selected,
        ]}
      >
        <Text style={[styles.number, { fontSize: size * 0.38 }]}>{value}</Text>
        {selected && !exploding && selectionOrder != null && (
          <Text style={[styles.order, { fontSize: size * 0.22 }]}>{selectionOrder}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// stiller
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
