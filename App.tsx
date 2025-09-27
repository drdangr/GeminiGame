import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, StoryEntry, PlayerState, SavedGame, GameSetting, SETTING_NAMES } from './types';
import * as geminiService from './services/geminiService';
import { speechService } from './services/speechService';
import Header from './components/Header';
import StoryDisplay from './components/StoryDisplay';
import ActionInput from './components/ActionInput';
import AuthScreen from './components/AuthScreen';
import PlayerStats from './components/PlayerStats';
import GameOverScreen from './components/GameOverScreen';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('UNAUTHENTICATED');
    const [gameSetting, setGameSetting] = useState<GameSetting>('FANTASY');
    const [story, setStory] = useState<StoryEntry[]>([]);
    const [playerState, setPlayerState] = useState<PlayerState>({ health: 100, inventory: [] });
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
        try {
            return !!window.speechSynthesis && localStorage.getItem('tts_enabled') === 'true';
        } catch {
            return false;
        }
    });
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => {
        try {
            return localStorage.getItem('tts_voice_uri');
        } catch {
            return null;
        }
    });

    const storyEndRef = useRef<HTMLDivElement>(null);

    // Auto-scrolling effect
    useEffect(() => {
        storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [story]);

    // Auto-saving effect
    useEffect(() => {
        if (playerName && (gameState === 'PLAYING' || gameState === 'ERROR')) {
            try {
                const gameToSave: SavedGame = { story, playerState, setting: gameSetting };
                localStorage.setItem(`gemini_adventure_${playerName}`, JSON.stringify(gameToSave));
            } catch (error) {
                console.error("Failed to save game:", error);
            }
        }
    }, [story, playerState, playerName, gameState, gameSetting]);

    // Effect for loading available speech synthesis voices
    useEffect(() => {
        if (!window.speechSynthesis) return;

        const loadAndSetVoices = () => {
            const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'ru-RU');
            setAvailableVoices(voices);
        };
        
        loadAndSetVoices();
        window.speechSynthesis.onvoiceschanged = loadAndSetVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Effect for saving TTS preference and selected voice
    useEffect(() => {
        try {
            if (window.speechSynthesis) {
                localStorage.setItem('tts_enabled', String(isTtsEnabled));
                if (selectedVoiceURI) {
                    localStorage.setItem('tts_voice_uri', selectedVoiceURI);
                } else {
                    localStorage.removeItem('tts_voice_uri');
                }
            }
        } catch (error) {
            console.error("Failed to save TTS settings:", error);
        }
    }, [isTtsEnabled, selectedVoiceURI]);

    // Effect for speaking new Gemini messages
    useEffect(() => {
        if (!isTtsEnabled || story.length === 0) {
            return;
        }

        const lastEntry = story[story.length - 1];
        if (lastEntry.speaker === 'gemini' && lastEntry.emotion) {
            speechService.speak(lastEntry.text, gameSetting, lastEntry.emotion, selectedVoiceURI);
        }
    }, [story, isTtsEnabled, gameSetting, selectedVoiceURI]);

    const handleToggleTts = useCallback(() => {
        if (!window.speechSynthesis) {
            alert("Ваш браузер не поддерживает синтез речи.");
            return;
        }
        setIsTtsEnabled(prev => {
            const newState = !prev;
            if (!newState) {
                speechService.cancel(); // Stop speaking immediately if user disables it
            }
            return newState;
        });
    }, []);
    
    const handleVoiceChange = useCallback((uri: string) => {
        setSelectedVoiceURI(uri === '' ? null : uri);
        speechService.cancel(); // Stop current speech to potentially use new voice immediately
    }, []);

    const handleNewGame = useCallback(async (name: string, setting: GameSetting) => {
        speechService.cancel();
        setPlayerName(name);
        setGameState('LOADING');
        setGameSetting(setting);
        setStory([{ id: Date.now(), speaker: 'system', text: `Создание нового мира (${SETTING_NAMES[setting]}) для ${name}...` }]);
        setPlayerState({ health: 100, inventory: [] });
        
        try {
            const initialResponse = await geminiService.startNewGame(setting);
            setStory([{ 
                id: Date.now(), 
                speaker: 'gemini', 
                text: initialResponse.storyText,
                emotion: initialResponse.emotion,
            }]);
            setPlayerState({ health: initialResponse.health, inventory: initialResponse.inventory });
            setGameState('PLAYING');
        } catch (error) {
            handleError(error);
        }
    }, []);
    
    const handleContinueGame = useCallback((name: string) => {
        speechService.cancel();
        try {
            const savedGameRaw = localStorage.getItem(`gemini_adventure_${name}`);
            if (savedGameRaw) {
                const savedGame: SavedGame = JSON.parse(savedGameRaw);
                // Check for game over state in saved game
                if (savedGame.playerState.health <= 0) {
                     handleNewGame(name, savedGame.setting || 'FANTASY'); // Start a new game if the saved one is over
                     return;
                }
                setPlayerName(name);
                setStory(savedGame.story);
                setPlayerState(savedGame.playerState);
                setGameSetting(savedGame.setting || 'FANTASY'); // Default to fantasy for old saves
                setGameState('PLAYING');
            } else {
                // If no save found, go back to auth screen to let them choose a setting.
                // This is better than defaulting to a new fantasy game.
                 setGameState('UNAUTHENTICATED');
            }
        } catch (error)
 {
            console.error("Failed to load game:", error);
            // If loading fails, just go back to auth screen.
            setGameState('UNAUTHENTICATED');
        }
    }, [handleNewGame]);

    const handleLogout = useCallback(() => {
        speechService.cancel();
        setPlayerName(null);
        setStory([]);
        setPlayerState({ health: 100, inventory: [] });
        setGameState('UNAUTHENTICATED');
    }, []);

    const handleSendAction = useCallback(async (action: string) => {
        if (!action.trim() || gameState !== 'PLAYING') return;

        const newUserEntry: StoryEntry = { id: Date.now(), speaker: 'user', text: action };
        setStory(prevStory => [...prevStory, newUserEntry]);
        setGameState('LOADING');

        try {
            const response = await geminiService.sendAction(action, playerState);
            const newGeminiEntry: StoryEntry = { 
                id: Date.now() + 1, 
                speaker: 'gemini', 
                text: response.storyText,
                emotion: response.emotion,
            };
            
            setStory(prevStory => [...prevStory, newGeminiEntry]);
            setPlayerState({ health: response.health, inventory: response.inventory });

            if (response.health <= 0) {
                setGameState('GAME_OVER');
                // Clear save game on death
                if(playerName) {
                    localStorage.removeItem(`gemini_adventure_${playerName}`);
                }
            } else {
                setGameState('PLAYING');
            }
        } catch (error) {
            handleError(error);
        }
    }, [gameState, playerState, playerName]);
    
    const handleError = (error: unknown) => {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка.';
        const errorEntry: StoryEntry = { id: Date.now() + 1, speaker: 'system', text: `Произошла ошибка: ${errorMessage}. История не может быть продолжена. Попробуйте обновить страницу или начать новую игру.` };
        setStory(prevStory => [...prevStory, errorEntry]);
        setGameState('ERROR');
    };

    if (gameState === 'UNAUTHENTICATED') {
        return <AuthScreen onNewGame={handleNewGame} onContinue={handleContinueGame} />;
    }

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col font-sans">
            <Header 
                onNewGame={() => playerName && handleNewGame(playerName, gameSetting)} 
                onLogout={handleLogout} 
                isLoading={gameState === 'LOADING'} 
                playerName={playerName} 
                isTtsEnabled={isTtsEnabled} 
                onToggleTts={handleToggleTts}
                availableVoices={availableVoices}
                selectedVoiceURI={selectedVoiceURI}
                onVoiceChange={handleVoiceChange}
             />
            <div className="flex-grow flex flex-row overflow-hidden">
                <PlayerStats playerState={playerState} gameSetting={gameSetting} />
                <main className="flex-grow flex flex-col overflow-hidden">
                    {story.length === 0 ? (
                         <div className="flex-grow flex flex-col justify-center items-center text-center p-8 font-mono">
                             <p className="text-gray-400">Нажмите "Новая игра", чтобы начать приключение.</p>
                         </div>
                    ) : (
                        <StoryDisplay story={story} storyEndRef={storyEndRef} />
                    )}
                </main>
            </div>
            {gameState === 'GAME_OVER' 
                ? <GameOverScreen onReturnToMenu={handleLogout} />
                : <ActionInput onSend={handleSendAction} isLoading={gameState === 'LOADING'} gameState={gameState} />
            }
        </div>
    );
};

export default App;