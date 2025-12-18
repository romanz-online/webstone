// Game dimension constants
export const CARD_WIDTH = 1.2
export const CARD_HEIGHT = 1.8
export const MINION_BOARD_WIDTH = 1.1
export const MINION_BOARD_HEIGHT = 1.5
export const HERO_WIDTH = 1.25
export const HERO_HEIGHT = 1.5

// Game layers
export enum Layer {
  HERO = 0.1,
  BOARD = 0.2,
  BOARD_MINION = 0.3,
  HAND = 0.4,
  TARGETING_SYSTEM = 0.999,
}

// Cursor constants
export const Cursor = {
  DEFAULT: 'url(/media/images/cursor/cursor.png) 10 2, auto',
  CLICK: 'url(/media/images/cursor/click.png) 10 2, auto',
  HIDDEN: 'none',
} as const
