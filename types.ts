export type GameState = 'UNAUTHENTICATED' | 'INITIAL' | 'LOADING' | 'PLAYING' | 'ERROR' | 'GAME_OVER';
export type GameSetting = 'FANTASY' | 'CYBERPUNK' | 'NOIR_DETECTIVE';
export type Emotion = 'neutral' | 'tense' | 'action' | 'sad' | 'calm';

export const SETTING_NAMES: Record<GameSetting, string> = {
    FANTASY: 'Фэнтези',
    CYBERPUNK: 'Киберпанк',
    NOIR_DETECTIVE: 'Нуарный детектив',
};

export interface StoryEntry {
  id: number;
  speaker: 'gemini' | 'user' | 'system';
  text: string;
  emotion?: Emotion;
}

export interface PlayerState {
  health: number;
  inventory: string[];
}

export interface SavedGame {
  story: StoryEntry[];
  playerState: PlayerState;
  setting: GameSetting;
}

export interface GeminiResponse {
  storyText: string;
  emotion: Emotion;
  health: number;
  inventory: string[];
}