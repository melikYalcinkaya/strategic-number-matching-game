import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@leaderboard_scores';
const MAX_ENTRIES = 10;

let memoryScores = [];
let useMemoryOnly = false;

function sortScores(scores) {
  return [...scores].sort((a, b) => b - a);
}

export async function loadScores() {
  if (useMemoryOnly) {
    return sortScores(memoryScores);
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return sortScores(memoryScores);
    const scores = JSON.parse(raw);
    if (!Array.isArray(scores)) return sortScores(memoryScores);
    memoryScores = scores;
    return sortScores(scores);
  } catch {
    useMemoryOnly = true;
    return sortScores(memoryScores);
  }
}

export async function saveScore(score) {
  const numericScore = Number(score) || 0;
  const scores = await loadScores();
  scores.push(numericScore);
  const trimmed = sortScores(scores).slice(0, MAX_ENTRIES);
  memoryScores = trimmed;

  if (useMemoryOnly) {
    return trimmed;
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    useMemoryOnly = true;
    return trimmed;
  }
}
