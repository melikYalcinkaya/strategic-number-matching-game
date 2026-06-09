const GRID_COLS = 8;
const GRID_ROWS = 10;
const NUMBER_POINTS = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 7, 6: 9, 7: 12, 8: 15, 9: 20 };

function getSpawnInterval(score) {
  const seconds = Math.max(1, 5 - Math.floor(score / 100));
  return seconds * 1000;
}

function isColumnFull(grid, col) {
  return grid.every(row => row[col] !== null);
}

function isGameOver(grid) {
  for (let col = 0; col < GRID_COLS; col++) {
    if (isColumnFull(grid, col)) return true;
  }
  return false;
}

function calculateMoveScore(grid, selectedCells) {
  return selectedCells.reduce((sum, { row, col }) => {
    const value = grid[row][col];
    return sum + (NUMBER_POINTS[value] ?? 0);
  }, 0);
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed += 1;
    console.log(`OK: ${label}`);
  } else {
    failed += 1;
    console.error(`FAIL: ${label}`);
  }
}

assert(getSpawnInterval(0) === 5000, '0 puan -> 5sn');
assert(getSpawnInterval(99) === 5000, '99 puan -> 5sn');
assert(getSpawnInterval(100) === 4000, '100 puan -> 4sn');
assert(getSpawnInterval(399) === 2000, '399 puan -> 2sn');
assert(getSpawnInterval(400) === 1000, '400 puan -> 1sn');
assert(getSpawnInterval(999) === 1000, '999 puan -> min 1sn');

const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
grid[9][0] = 4;
grid[9][1] = 5;
assert(calculateMoveScore(grid, [{ row: 9, col: 0 }, { row: 9, col: 1 }]) === 12, '4+5 blok puanı = 5+7 = 12');

const fullCol = Array.from({ length: GRID_ROWS }, (_, row) =>
  Array.from({ length: GRID_COLS }, (_, col) => (col === 3 ? row + 1 : null))
);
assert(isGameOver(fullCol), 'dolu sütunda game over');

const emptyGrid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
assert(!isGameOver(emptyGrid), 'boş gridde game over yok');

console.log(`\nSonuç: ${passed} geçti, ${failed} başarısız`);
process.exit(failed > 0 ? 1 : 0);
