import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Grid from '../components/Grid';
import GameOverScreen from '../screens/GameOverScreen';
import {
  createInitialGrid, randomTarget, randomNumber,
  isAdjacentToSelection, applyGravity, computeFallingOffsets, isGameOver,
  calculateMoveScore, getSpawnInterval, getSpawnIntervalSeconds, applyPenalty,
} from '../utils/gameLogic';
import { COLORS, GRID_ROWS, GRID_COLS, IS_IOS, platformShadow } from '../utils/constants';

const FALL_STEP        = 250;
const EXPLODE_DURATION = 220;
const GRAVITY_DURATION = 350;
const MAX_WRONG        = 3;

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const [gridLayout, setGridLayout] = useState(null);

  const [grid, setGrid]                   = useState(() => createInitialGrid());
  const [target, setTarget]               = useState(() => randomTarget());
  const [fallingBlock, setFallingBlock]   = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [wrongCount, setWrongCount]       = useState(0);
  const [score, setScore]                 = useState(0);
  const [message, setMessage]             = useState(null);
  const [gameOver, setGameOver]           = useState(false);

  const [isAnimating, setIsAnimating]       = useState(false);
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [fallingOffsets, setFallingOffsets] = useState(new Map());

  useEffect(() => {
    if (!gameOver && isGameOver(grid)) setGameOver(true);
  }, [grid, gameOver]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (fallingBlock !== null || gameOver) return;
    const t = setTimeout(() => {
      const col = Math.floor(Math.random() * GRID_COLS);
      setFallingBlock({ col, row: 0, value: randomNumber() });
    }, getSpawnInterval(score));
    return () => clearTimeout(t);
  }, [fallingBlock, gameOver, score]);

  useEffect(() => {
    if (fallingBlock === null || gameOver) return;
    const { col, row, value } = fallingBlock;
    const t = setTimeout(() => {
      const nextRow = row + 1;
      const blocked = nextRow >= GRID_ROWS || grid[nextRow][col] !== null;
      if (blocked) {
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
    return () => clearTimeout(t);
  }, [fallingBlock, grid, gameOver]);

  const handleCellPress = useCallback((row, col) => {
    if (isAnimating || gameOver || grid[row][col] === null) return;

    const existingIdx = selectedCells.findIndex(c => c.row === row && c.col === col);
    if (existingIdx !== -1) {
      if (existingIdx === selectedCells.length - 1) {
        setSelectedCells(prev => prev.slice(0, -1));
      }
      return;
    }

    if (selectedCells.length >= 4) { setMessage('En fazla 4 blok!'); return; }
    if (selectedCells.length > 0 && !isAdjacentToSelection(row, col, selectedCells)) {
      setMessage('Komşu blok seç!'); return;
    }

    setSelectedCells(prev => [...prev, { row, col }]);
  }, [grid, selectedCells, isAnimating, gameOver]);

  const handleConfirm = useCallback(() => {
    if (selectedCells.length < 2 || isAnimating || gameOver) return;

    const total = selectedCells.reduce((sum, { row, col }) => sum + grid[row][col], 0);

    if (total === target) {
      const moveScore = calculateMoveScore(grid, selectedCells);
      setScore(prev => prev + moveScore);
      setIsAnimating(true);
      setMessage('Doğru! ✓');

      const cellsToExplode = [...selectedCells];
      setSelectedCells([]);

      const explodingSet = new Set(cellsToExplode.map(({ row, col }) => `${row}-${col}`));
      setExplodingCells(explodingSet);

      setTimeout(() => {
        const preGravityGrid = grid.map(r => [...r]);
        cellsToExplode.forEach(({ row, col }) => { preGravityGrid[row][col] = null; });

        const postGravityGrid = applyGravity(preGravityGrid);
        const offsets = computeFallingOffsets(preGravityGrid, postGravityGrid);

        setExplodingCells(new Set());
        setFallingOffsets(offsets);
        setGrid(postGravityGrid);
        setTarget(randomTarget());

        setTimeout(() => {
          setFallingOffsets(new Map());
          setIsAnimating(false);
        }, GRAVITY_DURATION);
      }, EXPLODE_DURATION);

    } else {
      const newWrong = wrongCount + 1;
      setSelectedCells([]);

      if (newWrong >= MAX_WRONG) {
        setIsAnimating(true);
        setFallingBlock(null);
        setMessage('Ceza! Tüm sütunlardan blok indi!');
        setWrongCount(0);

        const penalizedGrid = applyPenalty(grid);
        setGrid(penalizedGrid);

        setTimeout(() => setIsAnimating(false), 300);
      } else {
        setWrongCount(newWrong);
        setMessage('Yanlış! ✗');
      }
    }
  }, [selectedCells, grid, target, isAnimating, gameOver, wrongCount]);

  const handleClear = useCallback(() => {
    if (isAnimating) return;
    setSelectedCells([]);
  }, [isAnimating]);

  const handleRestart = useCallback(() => {
    setGrid(createInitialGrid());
    setTarget(randomTarget());
    setFallingBlock(null);
    setSelectedCells([]);
    setWrongCount(0);
    setScore(0);
    setMessage(null);
    setGameOver(false);
    setIsAnimating(false);
    setExplodingCells(new Set());
    setFallingOffsets(new Map());
  }, []);

  const selectedTotal = selectedCells.reduce((sum, { row, col }) => {
    const val = grid[row]?.[col];
    return val != null ? sum + val : sum;
  }, 0);

  const spawnSeconds = getSpawnIntervalSeconds(score);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.targetText}>Hedef: {target}</Text>
        <Text style={styles.scoreText}>Puan: {score}</Text>
        <Text style={styles.wrongText}>Yanlış: {wrongCount}/{MAX_WRONG}</Text>
      </View>

      <Text style={styles.spawnText}>Düşme süresi: {spawnSeconds}s</Text>

      {selectedCells.length > 0 && (
        <Text style={styles.totalText}>Toplam: {selectedTotal} / Hedef: {target}</Text>
      )}

      {message != null && (
        <Text style={[styles.message, {
          color: message.startsWith('Doğru') ? '#a8e6cf'
            : message.startsWith('Ceza') ? '#ffeaa7'
            : '#ff6b6b',
        }]}>
          {message}
        </Text>
      )}

      <View
        style={styles.gridContainer}
        onLayout={(e) => setGridLayout(e.nativeEvent.layout)}
      >
        {gridLayout && (
          <Grid
            grid={grid}
            fallingBlock={fallingBlock}
            selectedCells={selectedCells}
            onCellPress={handleCellPress}
            explodingCells={explodingCells}
            fallingOffsets={fallingOffsets}
            containerWidth={gridLayout.width}
            containerHeight={gridLayout.height}
          />
        )}
      </View>

      <View style={[styles.buttonRow, { paddingBottom: Math.max(insets.bottom, IS_IOS ? 8 : 12) }]}>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClear}
          disabled={isAnimating || gameOver}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>TEMİZLE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (selectedCells.length < 2 || isAnimating || gameOver) && styles.disabled,
          ]}
          onPress={handleConfirm}
          disabled={selectedCells.length < 2 || isAnimating || gameOver}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>ONAYLA</Text>
        </TouchableOpacity>
      </View>

      {gameOver && (
        <GameOverScreen score={score} onRestart={handleRestart} />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: IS_IOS ? 16 : 20,
    paddingVertical: IS_IOS ? 10 : 12,
  },
  targetText: {
    color: COLORS.text,
    fontSize: IS_IOS ? 18 : 17,
    fontWeight: '700',
    letterSpacing: IS_IOS ? 0.5 : 1,
  },
  scoreText: {
    color: COLORS.scoreText,
    fontSize: IS_IOS ? 18 : 17,
    fontWeight: '700',
  },
  wrongText: {
    color: '#ff6b6b',
    fontSize: IS_IOS ? 16 : 17,
    fontWeight: '600',
  },
  spawnText: {
    color: '#a8e6cf',
    fontSize: IS_IOS ? 14 : 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalText: {
    color: '#ffeaa7',
    fontSize: IS_IOS ? 16 : 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: IS_IOS ? 17 : 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: IS_IOS ? 14 : 12,
    paddingTop: IS_IOS ? 10 : 12,
    paddingHorizontal: IS_IOS ? 20 : 0,
  },
  clearBtn: {
    backgroundColor: '#4a4a6a',
    paddingHorizontal: IS_IOS ? 32 : 28,
    paddingVertical: IS_IOS ? 14 : 12,
    borderRadius: IS_IOS ? 12 : 8,
    minHeight: IS_IOS ? 48 : undefined,
    justifyContent: 'center',
    ...platformShadow('#000', { opacity: 0.2, radius: 6, offsetY: 2, elevation: 3 }),
  },
  confirmBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: IS_IOS ? 32 : 28,
    paddingVertical: IS_IOS ? 14 : 12,
    borderRadius: IS_IOS ? 12 : 8,
    minHeight: IS_IOS ? 48 : undefined,
    justifyContent: 'center',
    ...platformShadow('#6c5ce7', { opacity: 0.4, radius: 10, offsetY: 4, elevation: 5 }),
  },
  disabled: {
    opacity: IS_IOS ? 0.4 : 0.35,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: IS_IOS ? 16 : 15,
    letterSpacing: IS_IOS ? 0.8 : 1,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums'] },
      default: {},
    }),
  },
});
