import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function GameOverScreen({ onRestart }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current; // arka plan opaklığı
  const slideAnim = useRef(new Animated.Value(60)).current; // kartın Y konumu
  const scaleAnim = useRef(new Animated.Value(0.7)).current; // kartın ölçeği
  const pulseAnim = useRef(new Animated.Value(1)).current; // buton nabız efekti

  useEffect(() => {
    // Arka planı göster
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Kart yukarı kayarak ve büyüyerek gelsin
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Butonu sürekli büyüt-küçült
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const timeout = setTimeout(() => pulse.start(), 800);
    return () => { clearTimeout(timeout); pulse.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.emoji}>💥</Text>
          <Text style={styles.title}>OYUN BİTTİ</Text>

          <View style={styles.divider} />

          {/* Tekrar oyna butonu */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
              <Text style={styles.restartText}>🔄  TEKRAR OYNA</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

//stiller
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 25, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#1e1e3a',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 32,
    width: width * 0.78,
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#6c5ce750',
    marginVertical: 28,
  },
  restartBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  restartText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 2,
  },
});