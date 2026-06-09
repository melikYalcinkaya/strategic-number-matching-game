import { Platform } from 'react-native';

//Temel Özellikler
export const GRID_COLS = 8;
export const GRID_ROWS = 10;
export const CELL_GAP = 2;

export const COLORS = {
  background: '#1a1a2e',
  gridBackground: '#16213e',
  text: '#ffffff',
  scoreText: '#e2e2e2',
};

export const IS_IOS = Platform.OS === 'ios';

/** iOS shadow + Android elevation in one helper */
export function platformShadow(color, { opacity = 0.35, radius = 8, offsetY = 3, elevation = 4 } = {}) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  });
}

export const NUMBER_COLORS = {
  1: '#FF6B6B',
  2: '#4ECDC4',
  3: '#45B7D1',
  4: '#96CEB4',
  5: '#FFEAA7',
  6: '#DDA0DD',
  7: '#FF8C42',
  8: '#6C5CE7',
  9: '#A8E6CF',
};

export const NUMBER_POINTS = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 9,
  7: 12,
  8: 15,
  9: 20,
};
