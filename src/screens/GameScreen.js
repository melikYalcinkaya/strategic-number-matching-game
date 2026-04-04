import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Grid from '../components/Grid';
import {
  createInitialGrid, randomTarget, randomNumber,
  isAdjacentToSelection, applyGravity,
} from '../utils/gameLogic';
import { COLORS, GRID_ROWS, GRID_COLS } from '../utils/constants';

const SPAWN_INTERVAL = 5000;
const FALL_STEP = 250;

export default function GameScreen() {
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [target, setTarget] = useState(() => randomTarget());
  const [score] = useState(0);
  const [fallingBlock, setFallingBlock] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [message, setMessage] = useState(null);

  // Mesajı 2 saniye sonra temizle
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(t);
  }, [message]);

  // Önceki blok yerleştikten 5s sonra yeni blok düşür
  useEffect(() => {
    if (fallingBlock !== null) return;
    const t = setTimeout(() => {
      const col = Math.floor(Math.random() * GRID_COLS);
      setFallingBlock({ col, row: 0, value: randomNumber() });
    }, SPAWN_INTERVAL);
    return () => clearTimeout(t);
  }, [fallingBlock]);

  // Bloğu her 250ms'de bir satır aşağı taşı
  useEffect(() => {
    if (fallingBlock === null) return;
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
  }, [fallingBlock, grid]);

  const handleCellPress = useCallback((row, col) => {
    if (grid[row][col] === null) return;

    const existingIdx = selectedCells.findIndex(c => c.row === row && c.col === col);
    if (existingIdx !== -1) {
      // Sadece zincirin sonundaki bloğu çıkar
      if (existingIdx === selectedCells.length - 1) {
        setSelectedCells(prev => prev.slice(0, -1));
      }
      return;
    }

    if (selectedCells.length >= 4) {
      setMessage('En fazla 4 blok!');
      return;
    }

    if (selectedCells.length > 0 && !isAdjacentToSelection(row, col, selectedCells)) {
      setMessage('Komşu blok seç!');
      return;
    }

    setSelectedCells(prev => [...prev, { row, col }]);
  }, [grid, selectedCells]);

  const handleConfirm = useCallback(() => {
    if (selectedCells.length < 2) return;

    const total = selectedCells.reduce((sum, { row, col }) => sum + grid[row][col], 0);

    if (total === target) {
      setGrid(prev => {
        let next = prev.map(r => [...r]);
        selectedCells.forEach(({ row, col }) => { next[row][col] = null; });
        next = applyGravity(next);
        return next;
      });
      setTarget(randomTarget());
      setMessage('Doğru! ✓');
    } else {
      setWrongCount(prev => prev + 1);
      setMessage('Yanlış! ✗');
    }

    setSelectedCells([]);
  }, [selectedCells, grid, target]);

  const handleClear = useCallback(() => setSelectedCells([]), []);

  const selectedTotal = selectedCells.reduce((sum, { row, col }) => {
    const val = grid[row]?.[col];
    return val != null ? sum + val : sum;
  }, 0);

  const isCorrect = message?.startsWith('Doğru');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.targetText}>Hedef: {target}</Text>
        <Text style={styles.wrongText}>Yanlış: {wrongCount}/3</Text>
      </View>

      {selectedCells.length > 0 && (
        <Text style={styles.totalText}>Toplam: {selectedTotal} / Hedef: {target}</Text>
      )}

      {message != null && (
        <Text style={[styles.message, { color: isCorrect ? '#a8e6cf' : '#ff6b6b' }]}>
          {message}
        </Text>
      )}

      <View style={styles.gridContainer}>
        <Grid
          grid={grid}
          fallingBlock={fallingBlock}
          selectedCells={selectedCells}
          onCellPress={handleCellPress}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.btnText}>TEMİZLE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, selectedCells.length < 2 && styles.disabled]}
          onPress={handleConfirm}
          disabled={selectedCells.length < 2}
        >
          <Text style={styles.btnText}>ONAYLA</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  targetText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  wrongText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: '600',
  },
  totalText: {
    color: '#ffeaa7',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  clearBtn: {
    backgroundColor: '#4a4a6a',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.35,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  footer: {
    paddingVertical: 12,
  },
  scoreText: {
    color: COLORS.scoreText,
    fontSize: 18,
    fontWeight: '600',
  },
});
