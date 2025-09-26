export type GameState = 'UNAUTHENTICATED' | 'INITIAL' | 'LOADING' | 'PLAYING' | 'ERROR';

export interface StoryEntry {
  id: number;
  speaker: 'gemini' | 'user' | 'system';
  text: string;
}

export interface PlayerState {
  health: number;
  inventory: string[];
}

export interface SavedGame {
  story: StoryEntry[];
  playerState: PlayerState;
}

export interface GeminiResponse {
  storyText: string;
  health: number;
  inventory: string[];
}
