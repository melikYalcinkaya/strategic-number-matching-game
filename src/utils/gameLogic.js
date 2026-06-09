import { GRID_COLS, GRID_ROWS, NUMBER_POINTS } from './constants';

// Başlangıç grid'i oluşturma
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

// Rastgele sayı üretme 1 ile 9 arasında
export function randomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

// Random hedef üretme 5 ile 20 arasında
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

// Her sütunda null olmayan değerleri alta toplar, üstü null bırakırız
export function applyGravity(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = Array.from({ length: rows }, () => Array(cols).fill(null)); // boş grid
  for (let col = 0; col < cols; col++) {
    // Bu şekilde `flatMap` ile her kolonda ara array üretmekten kaçınırız.
    const values = [];
    for (let row = 0; row < rows; row++) {
      const cell = grid[row][col];
      if (cell !== null) values.push(cell);
    }

    const startRow = rows - values.length;
    for (let i = 0; i < values.length; i++) {
      next[startRow + i][col] = values[i]; // aldıklarını aşağıya yerleştir
    }
  }
  return next;
}

// Yerçekimi öncesi ve sonrası grid karşılaştırarak her bloğun kaç satır düştüğünü hesaplar.
// Döndürülen Map: "yeniSatır-sütun" düşülen satır sayısı
export function computeFallingOffsets(preGrid, postGrid) {
  const rows = preGrid.length;
  const cols = preGrid[0].length;
  const offsets = new Map();

  for (let col = 0; col < cols; col++) {
    const preRows = [];
    for (let row = 0; row < rows; row++) {
      if (preGrid[row][col] !== null) preRows.push(row);
    }

    const postRows = [];
    for (let row = 0; row < rows; row++) {
      if (postGrid[row][col] !== null) postRows.push(row);
    }

    for (let i = 0; i < postRows.length; i++) {
      const fallDistance = postRows[i] - preRows[i];
      if (fallDistance > 0) {
        offsets.set(`${postRows[i]}-${col}`, fallDistance);
      }
    }
  }

  return offsets;
}

export function isColumnFull(grid, col) {
  return grid.every(row => row[col] !== null);
}

// Herhangi bir sütun 10 satıra kadar tamamen dolunca oyun biter
export function isGameOver(grid) {
  for (let col = 0; col < GRID_COLS; col++) {
    if (isColumnFull(grid, col)) return true;
  }
  return false;
}

export function calculateMoveScore(grid, selectedCells) {
  return selectedCells.reduce((sum, { row, col }) => {
    const value = grid[row][col];
    return sum + (NUMBER_POINTS[value] ?? 0);
  }, 0);
}

export function getSpawnInterval(score) {
  const seconds = Math.max(1, 5 - Math.floor(score / 100));
  return seconds * 1000;
}

export function getSpawnIntervalSeconds(score) {
  return Math.max(1, 5 - Math.floor(score / 100));
}

// 3 yanlış hamlede tüm sütunlardan birer blok indir
export function applyPenalty(grid) {
  const next = grid.map(r => [...r]);

  for (let col = 0; col < GRID_COLS; col++) {
    const values = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      if (next[row][col] !== null) values.push(next[row][col]);
    }
    if (values.length >= GRID_ROWS) continue;

    values.unshift(randomNumber());
    for (let row = 0; row < GRID_ROWS; row++) {
      next[row][col] = null;
    }
    const startRow = GRID_ROWS - values.length;
    for (let i = 0; i < values.length; i++) {
      next[startRow + i][col] = values[i];
    }
  }

  return next;
}
