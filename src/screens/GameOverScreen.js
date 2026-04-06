import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function GameOverScreen({ score, wrongCount, onRestart }) {
  // Animasyon değerleri
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(60)).current;
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const scoreAnim   = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Arka plan fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Kart yukarı kayarak gelsin
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

    // Skor sayacı animasyonu
    Animated.timing(scoreAnim, {
      toValue: score,
      duration: 1200,
      delay: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Buton pulse efekti (döngü)
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
    const timeout = setTimeout(() => pulse.start(), 1000);
    return () => {
      clearTimeout(timeout);
      pulse.stop();
    };
  }, []);

  // Skor animasyonunu integer olarak göster
  const animatedScore = scoreAnim.interpolate({
    inputRange: [0, Math.max(score, 1)],
    outputRange: [0, Math.max(score, 1)],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Başlık */}
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>💥</Text>
            <Text style={styles.title}>OYUN BİTTİ</Text>
            <Text style={styles.emoji}>💥</Text>
          </View>

          <View style={styles.divider} />

          {/* Skor */}
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>PUANINIZ</Text>
            <AnimatedScoreText animatedValue={scoreAnim} maxScore={score} />
          </View>

          {/* İstatistikler */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{wrongCount}</Text>
              <Text style={styles.statLabel}>Yanlış</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxMiddle]}>
              <Text style={styles.statValue}>
                {score > 0 ? getRank(score) : '—'}
              </Text>
              <Text style={styles.statLabel}>Derece</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{getCorrectCount(score, wrongCount)}</Text>
              <Text style={styles.statLabel}>Doğru</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tekrar Oyna butonu */}
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

// Animasyonlu skor sayacı için ayrı bileşen
function AnimatedScoreText({ animatedValue, maxScore }) {
  const displayValue = useRef(new Animated.Value(0)).current;

  // animatedValue'yu integer string'e dönüştürmek için listener kullanıyoruz
  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    const id = animatedValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    return () => animatedValue.removeListener(id);
  }, [animatedValue]);

  return <Text style={styles.scoreValue}>{displayScore}</Text>;
}

// Puan → Derece
function getRank(score) {
  if (score >= 500) return 'S+';
  if (score >= 300) return 'S';
  if (score >= 150) return 'A';
  if (score >= 75)  return 'B';
  if (score >= 30)  return 'C';
  return 'D';
}

// Tahmini doğru sayısı (her doğru 10 puan varsayımı)
function getCorrectCount(score, wrongCount) {
  return Math.max(0, Math.round(score / 10));
}

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
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: width * 0.85,
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#6c5ce750',
    marginVertical: 20,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a29bfe',
    letterSpacing: 3,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    color: '#ffeaa7',
    letterSpacing: -2,
    lineHeight: 80,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderRadius: 10,
  },
  statBoxMiddle: {
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a29bfe',
    letterSpacing: 1,
  },
  restartBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
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