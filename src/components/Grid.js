import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Block from './Block';
import { GRID_COLS, GRID_ROWS, CELL_GAP } from '../utils/constants';

export default function Grid({ grid, fallingBlock }) {
  const { width, height } = useWindowDimensions();

  // Reserve space for header (~80px) and footer (~60px) and some padding
  const availableWidth = width - 24;
  const availableHeight = height - 200;

  // Cell size based on whichever dimension is more constraining
  const cellByWidth = (availableWidth - CELL_GAP * (GRID_COLS - 1)) / GRID_COLS;
  const cellByHeight = (availableHeight - CELL_GAP * (GRID_ROWS - 1)) / GRID_ROWS;
  const cellSize = Math.floor(Math.min(cellByWidth, cellByHeight));

  const gridWidth = cellSize * GRID_COLS + CELL_GAP * (GRID_COLS - 1);
  const gridHeight = cellSize * GRID_ROWS + CELL_GAP * (GRID_ROWS - 1);

  return (
    <View style={[styles.grid, { width: gridWidth, height: gridHeight }]}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <View
            key={`${rowIndex}-${colIndex}`}
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
            {cell !== null && <Block value={cell} size={cellSize} />}
          </View>
        ))
      )}

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
