import { GRID_COLS, GRID_ROWS } from './constants';

/**
 * Creates initial grid state.
 * Bottom 3 rows (indices 7, 8, 9) are filled with random blocks (1-9).
 * Top 7 rows are null (empty).
 */
export function createInitialGrid() {
  const grid = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    const rowData = [];
    for (let col = 0; col < GRID_COLS; col++) {
      if (row >= 7) {
        rowData.push(randomNumber());
      } else {
        rowData.push(null);
      }
    }
    grid.push(rowData);
  }

  return grid;
}

/**
 * Returns a random integer between 1 and 9 inclusive.
 */
export function randomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

/**
 * Returns a random target number between 5 and 20 inclusive.
 */
export function randomTarget() {
  return Math.floor(Math.random() * 16) + 5;
}
