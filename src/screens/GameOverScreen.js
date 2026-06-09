import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IS_IOS, platformShadow } from '../utils/constants';
import { saveScore } from '../utils/leaderboard';

const { width } = Dimensions.get('window');

export default function GameOverScreen({ score, onRestart }) {
  const [leaderboard, setLeaderboard] = useState(null);
  const savedRef = useRef(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      try {
        const scores = await saveScore(score);
        setLeaderboard(scores);
      } catch {
        setLeaderboard([score]);
      }
    })();
  }, [score]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

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
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim]);

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
          <Text style={styles.reason}>Bir sütun tamamen doldu</Text>

          <Text style={styles.scoreLabel}>SKORUN</Text>
          <Text style={styles.scoreValue}>{score}</Text>

          <View style={styles.divider} />

          <Text style={styles.leaderboardTitle}>LİDERLİK TABLOSU</Text>
          <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
            {leaderboard === null ? (
              <Text style={styles.emptyText}>Kaydediliyor...</Text>
            ) : leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>Henüz kayıt yok</Text>
            ) : (
              leaderboard.map((entry, index) => (
                <View
                  key={`${entry}-${index}`}
                  style={[styles.leaderboardRow, entry === score && styles.highlightRow]}
                >
                  <Text style={styles.rankText}>{index + 1}.</Text>
                  <Text style={styles.entryScore}>{entry}</Text>
                </View>
              ))
            )}
          </ScrollView>

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
    borderRadius: IS_IOS ? 24 : 20,
    paddingVertical: IS_IOS ? 32 : 28,
    paddingHorizontal: IS_IOS ? 28 : 24,
    width: width * 0.85,
    maxWidth: 360,
    maxHeight: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c5ce7',
    ...platformShadow('#6c5ce7', { opacity: 0.55, radius: IS_IOS ? 28 : 24, offsetY: 0, elevation: 20 }),
  },
  emoji: {
    fontSize: IS_IOS ? 44 : 40,
    marginBottom: 8,
  },
  title: {
    fontSize: IS_IOS ? 26 : 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: IS_IOS ? 2 : 4,
  },
  reason: {
    color: '#a8a8c8',
    fontSize: IS_IOS ? 13 : 12,
    marginTop: 6,
    marginBottom: 12,
  },
  scoreLabel: {
    color: '#a8a8c8',
    fontSize: IS_IOS ? 13 : 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  scoreValue: {
    color: '#ffeaa7',
    fontSize: IS_IOS ? 42 : 40,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#6c5ce750',
    marginVertical: 16,
  },
  leaderboardTitle: {
    color: '#ffffff',
    fontSize: IS_IOS ? 15 : 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  leaderboardList: {
    width: '100%',
    maxHeight: 160,
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  highlightRow: {
    backgroundColor: '#6c5ce730',
  },
  rankText: {
    color: '#a8a8c8',
    fontSize: IS_IOS ? 15 : 14,
    fontWeight: '600',
    width: 32,
  },
  entryScore: {
    color: '#ffffff',
    fontSize: IS_IOS ? 16 : 15,
    fontWeight: '700',
  },
  emptyText: {
    color: '#a8a8c8',
    fontSize: IS_IOS ? 14 : 13,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  restartBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: IS_IOS ? 44 : 40,
    paddingVertical: IS_IOS ? 18 : 16,
    borderRadius: IS_IOS ? 16 : 14,
    minHeight: IS_IOS ? 52 : undefined,
    justifyContent: 'center',
    ...platformShadow('#6c5ce7', { opacity: 0.5, radius: 12, offsetY: 4, elevation: 8 }),
  },
  restartText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: IS_IOS ? 16 : 17,
    letterSpacing: IS_IOS ? 1.5 : 2,
  },
});
