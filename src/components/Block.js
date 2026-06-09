import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { NUMBER_COLORS, IS_IOS, platformShadow } from '../utils/constants';

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

  const blockStyle = [
    styles.block,
    {
      width: size,
      height: size,
      backgroundColor: bgColor,
      borderRadius: IS_IOS ? 8 : 6,
    },
    IS_IOS && platformShadow('#000', { opacity: 0.18, radius: 4, offsetY: 2, elevation: 2 }),
    selected && !exploding && styles.selected,
    selected && !exploding && IS_IOS && platformShadow('#fff', { opacity: 0.35, radius: 8, offsetY: 0, elevation: 0 }),
    transforms.length > 0 && { transform: transforms },
    { opacity: exploding ? explosionOpacity : 1 },
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={exploding}
      hitSlop={IS_IOS ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
    >
      <Animated.View style={blockStyle}>
        <Text style={[styles.number, { fontSize: size * (IS_IOS ? 0.36 : 0.38) }]}>{value}</Text>
        {selected && !exploding && selectionOrder != null && (
          <Text style={[styles.order, { fontSize: size * 0.22 }]}>{selectionOrder}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// stiller
const styles = StyleSheet.create({
  block: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selected: {
    borderWidth: IS_IOS ? 2.5 : 3,
    borderColor: 'white',
    transform: [{ scale: IS_IOS ? 1.05 : 1.06 }],
  },
  number: {
    fontWeight: '700',
    color: '#1a1a2e',
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums'] },
      default: {},
    }),
  },
  order: {
    position: 'absolute',
    top: IS_IOS ? 3 : 2,
    right: IS_IOS ? 4 : 3,
    fontWeight: '700',
    color: 'white',
  },
});
