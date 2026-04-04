import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Grid from '../components/Grid';
import { createInitialGrid, randomTarget, randomNumber } from '../utils/gameLogic';
import { COLORS, GRID_ROWS, GRID_COLS } from '../utils/constants';

const SPAWN_INTERVAL = 5000; // ms between blocks
const FALL_STEP = 250;       // ms per row

export default function GameScreen() {
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [target] = useState(() => randomTarget());
  const [score] = useState(0);
  const [fallingBlock, setFallingBlock] = useState(null); // { col, row, value }

  // Spawn a new block 5 seconds after the previous one settled (or on mount)
  useEffect(() => {
    if (fallingBlock !== null) return;
    const timer = setTimeout(() => {
      const col = Math.floor(Math.random() * GRID_COLS);
      setFallingBlock({ col, row: 0, value: randomNumber() });
    }, SPAWN_INTERVAL);
    return () => clearTimeout(timer);
  }, [fallingBlock]);

  // Move falling block down one row every 250ms
  useEffect(() => {
    if (fallingBlock === null) return;
    const { col, row, value } = fallingBlock;
    const timer = setTimeout(() => {
      const nextRow = row + 1;
      const blocked = nextRow >= GRID_ROWS || grid[nextRow][col] !== null;
      if (blocked) {
        // Settle into grid
        setGrid(prev => {
          const next = prev.map(r => [...r]);
          next[row][col] = value;
          return next;
        });
        setFallingBlock(null);
      } else {
        setFallingBlock(prev => ({ ...prev, row: nextRow }));
      }
    }, FALL_STEP);
    return () => clearTimeout(timer);
  }, [fallingBlock, grid]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.targetText}>Hedef Sayı: {target}</Text>
      </View>

      <View style={styles.gridContainer}>
        <Grid grid={grid} fallingBlock={fallingBlock} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.scoreText}>Puan: {score}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  targetText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  scoreText: {
    color: COLORS.scoreText,
    fontSize: 20,
    fontWeight: '600',
  },
});
