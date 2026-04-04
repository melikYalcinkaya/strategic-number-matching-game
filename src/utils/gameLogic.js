import { GRID_COLS, GRID_ROWS } from './constants';

export function createInitialGrid() {
  const grid = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowData = [];
    for (let col = 0; col < GRID_COLS; col++) {
      rowData.push(row >= 7 ? randomNumber() : null);
    }
    grid.push(rowData);
  }
  return grid;
}

export function randomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

export function randomTarget() {
  return Math.floor(Math.random() * 16) + 5;
}

// 8 yönlü komşuluk kontrolü
export function isNeighbor(row1, col1, row2, col2) {
  return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
}

// Seçili hücrelerden herhangi birine komşu mu?
export function isAdjacentToSelection(row, col, selectedCells) {
  return selectedCells.some(c => isNeighbor(row, col, c.row, c.col));
}

// Her sütunda null olmayan değerleri alta toplar, üstü null bırakır
export function applyGravity(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (let col = 0; col < cols; col++) {
    const values = grid.flatMap((row) => row[col] !== null ? [row[col]] : []);
    for (let i = 0; i < values.length; i++) {
      next[rows - values.length + i][col] = values[i];
    }
  }
  return next;
}
