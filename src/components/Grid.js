import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Animated, Easing } from 'react-native';
import Block from './Block';
import { GRID_COLS, GRID_ROWS, CELL_GAP } from '../utils/constants';

// Grid: oyun tahtasını çizer.
// explodingCells : Set<"satır-sütun"> — patlamakta olan hücreler
// fallingOffsets : Map<"yeniSatır-sütun", satırSayısı> — düşme mesafeleri
export default function Grid({ grid, fallingBlock, selectedCells = [], onCellPress, explodingCells, fallingOffsets }) {
  const { width, height } = useWindowDimensions();

  const availableWidth  = width - 24;
  const availableHeight = height - 200;

  const cellByWidth  = (availableWidth  - CELL_GAP * (GRID_COLS - 1)) / GRID_COLS;
  const cellByHeight = (availableHeight - CELL_GAP * (GRID_ROWS - 1)) / GRID_ROWS;
  const cellSize = Math.floor(Math.min(cellByWidth, cellByHeight));

  const gridWidth  = cellSize * GRID_COLS + CELL_GAP * (GRID_COLS - 1);
  const gridHeight = cellSize * GRID_ROWS + CELL_GAP * (GRID_ROWS - 1);

  // Hızlı seçim sorgusu: "satır-sütun" → sıra numarası (1'den başlar)
  const selectionMap = new Map(selectedCells.map((c, i) => [`${c.row}-${c.col}`, i + 1]));

  // Yerçekimi animasyon değerlerini tut: "satır-sütun" → Animated.Value (translateY)
  const fallAnimsRef = useRef(new Map());

  useEffect(() => {
    if (!fallingOffsets || fallingOffsets.size === 0) {
      fallAnimsRef.current = new Map();
      return;
    }

    const newAnims = new Map();
    fallingOffsets.forEach((fallRows, key) => {
      // Başlangıç: bloğun eski konumu (negatif offset = yukarıda)
      const pixelOffset = fallRows * (cellSize + CELL_GAP);
      const anim = new Animated.Value(-pixelOffset);
      newAnims.set(key, anim);

      // Yumuşak düşme: eski konumdan yeni konuma (300ms)
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });

    fallAnimsRef.current = newAnims;
  }, [fallingOffsets, cellSize]);

  return (
    <View style={[styles.grid, { width: gridWidth, height: gridHeight }]}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const selectionOrder = selectionMap.get(key);
          const isExploding    = explodingCells?.has(key) ?? false;
          const fallAnim       = fallAnimsRef.current.get(key);

          return (
            <View
              key={key}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  left: colIndex * (cellSize + CELL_GAP),
                  top: rowIndex * (cellSize + CELL_GAP),
                  backgroundColor: cell === null ? '#16213e' : 'transparent',
                  borderRadius: 6,
                },
              ]}
            >
              {cell !== null && (
                <Block
                  value={cell}
                  size={cellSize}
                  onPress={() => onCellPress?.(rowIndex, colIndex)}
                  selected={selectionOrder != null}
                  selectionOrder={selectionOrder}
                  exploding={isExploding}
                  fallAnim={fallAnim}
                />
              )}
            </View>
          );
        })
      )}

      {/* Yukarıdan düşen aktif blok */}
      {fallingBlock !== null && (
        <View
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              left: fallingBlock.col * (cellSize + CELL_GAP),
              top: fallingBlock.row * (cellSize + CELL_GAP),
              borderRadius: 6,
            },
          ]}
        >
          <Block value={fallingBlock.value} size={cellSize} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
  },
});
