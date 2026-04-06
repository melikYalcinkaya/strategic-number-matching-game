import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Grid from '../components/Grid';
import GameOverScreen from '../screens/GameOverScreen';
import {
  createInitialGrid, randomTarget, randomNumber,
  isAdjacentToSelection, applyGravity, computeFallingOffsets, isGameOver,
} from '../utils/gameLogic';
import { COLORS, GRID_ROWS, GRID_COLS } from '../utils/constants';

const SPAWN_INTERVAL   = 5000; // yeni blok düşmeden önceki bekleme (ms)
const FALL_STEP        = 250;  // bloğun her satır için düşme süresi (ms)
const EXPLODE_DURATION = 220;  // patlama animasyonu süresi (ms)
const GRAVITY_DURATION = 350;  // yerçekimi animasyonu süresi (ms)
const MAX_WRONG        = 3;    // maksimum yanlış hakkı

export default function GameScreen() {
  const [grid, setGrid]                   = useState(() => createInitialGrid());
  const [target, setTarget]               = useState(() => randomTarget());
  const [fallingBlock, setFallingBlock]   = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [wrongCount, setWrongCount]       = useState(0);
  const [message, setMessage]             = useState(null);
  const [gameOver, setGameOver]           = useState(false);

  // Animasyon state'leri
  const [isAnimating, setIsAnimating]       = useState(false);
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [fallingOffsets, setFallingOffsets] = useState(new Map());

  // Yanlış hak dolunca oyunu bitir
  useEffect(() => {
    if (wrongCount >= MAX_WRONG && !gameOver) setGameOver(true);
  }, [wrongCount]);

  // Grid'in ilk satırı dolunca oyunu bitir
  useEffect(() => {
    if (!gameOver && isGameOver(grid)) setGameOver(true);
  }, [grid]);

  // Mesajı 2 saniye sonra temizle
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(t);
  }, [message]);

  // Önceki blok yerleştikten SPAWN_INTERVAL ms sonra yeni blok düşür
  useEffect(() => {
    if (fallingBlock !== null || gameOver) return;
    const t = setTimeout(() => {
      const col = Math.floor(Math.random() * GRID_COLS);
      setFallingBlock({ col, row: 0, value: randomNumber() });
    }, SPAWN_INTERVAL);
    return () => clearTimeout(t);
  }, [fallingBlock, gameOver]);

  // Bloğu her FALL_STEP ms'de bir satır aşağı taşı
  useEffect(() => {
    if (fallingBlock === null || gameOver) return;
    const { col, row, value } = fallingBlock;
    const t = setTimeout(() => {
      const nextRow = row + 1;
      const blocked = nextRow >= GRID_ROWS || grid[nextRow][col] !== null;
      if (blocked) {
        // Blok bir yere oturdu, grid'e işle
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

  // Hücreye dokunulduğunda seçim yönetimi
  const handleCellPress = useCallback((row, col) => {
    if (isAnimating || gameOver || grid[row][col] === null) return;

    const existingIdx = selectedCells.findIndex(c => c.row === row && c.col === col);
    if (existingIdx !== -1) {
      // Sadece zincirin sonundaki bloğu çıkar
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

  // Seçimi onayla: doğruysa patlama + yerçekimi animasyonu, yanlışsa hak azalt
  const handleConfirm = useCallback(() => {
    if (selectedCells.length < 2 || isAnimating || gameOver) return;

    const total = selectedCells.reduce((sum, { row, col }) => sum + grid[row][col], 0);

    if (total === target) {
      setIsAnimating(true);
      setMessage('Doğru! ✓');

      const cellsToExplode = [...selectedCells];
      setSelectedCells([]);

      // 1. Patlama animasyonunu başlat
      const explodingSet = new Set(cellsToExplode.map(({ row, col }) => `${row}-${col}`));
      setExplodingCells(explodingSet);

      // 2. Patlama bitince yerçekimini uygula
      setTimeout(() => {
        const preGravityGrid = grid.map(r => [...r]);
        cellsToExplode.forEach(({ row, col }) => { preGravityGrid[row][col] = null; });

        const postGravityGrid = applyGravity(preGravityGrid);
        const offsets = computeFallingOffsets(preGravityGrid, postGravityGrid);

        setExplodingCells(new Set());
        setFallingOffsets(offsets);
        setGrid(postGravityGrid);
        setTarget(randomTarget());

        // 3. Yerçekimi animasyonu bitince temizle
        setTimeout(() => {
          setFallingOffsets(new Map());
          setIsAnimating(false);
        }, GRAVITY_DURATION);
      }, EXPLODE_DURATION);

    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setMessage(newWrong >= MAX_WRONG ? 'Yanlış! Oyun bitti ✗' : 'Yanlış! ✗');
      setSelectedCells([]);
    }
  }, [selectedCells, grid, target, isAnimating, gameOver, wrongCount]);

  // Seçimi temizle
  const handleClear = useCallback(() => {
    if (isAnimating) return;
    setSelectedCells([]);
  }, [isAnimating]);

  // Oyunu sıfırla
  const handleRestart = useCallback(() => {
    setGrid(createInitialGrid());
    setTarget(randomTarget());
    setFallingBlock(null);
    setSelectedCells([]);
    setWrongCount(0);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.targetText}>Hedef: {target}</Text>
        <Text style={styles.wrongText}>Yanlış: {wrongCount}/{MAX_WRONG}</Text>
      </View>

      {selectedCells.length > 0 && (
        <Text style={styles.totalText}>Toplam: {selectedTotal} / Hedef: {target}</Text>
      )}

      {message != null && (
        <Text style={[styles.message, { color: message.startsWith('Doğru') ? '#a8e6cf' : '#ff6b6b' }]}>
          {message}
        </Text>
      )}

      <View style={styles.gridContainer}>
        <Grid
          grid={grid}
          fallingBlock={fallingBlock}
          selectedCells={selectedCells}
          onCellPress={handleCellPress}
          explodingCells={explodingCells}
          fallingOffsets={fallingOffsets}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClear}
          disabled={isAnimating || gameOver}
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
        >
          <Text style={styles.btnText}>ONAYLA</Text>
        </TouchableOpacity>
      </View>

      {/* Oyun bitince overlay olarak göster */}
      {gameOver && (
        <GameOverScreen onRestart={handleRestart} />
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
});