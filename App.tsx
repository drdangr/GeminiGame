import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, StoryEntry, PlayerState, SavedGame, GameSetting } from './types';
import * as geminiService from './services/geminiService';
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

    const handleNewGame = useCallback(async (name: string, setting: GameSetting) => {
        setPlayerName(name);
        setGameState('LOADING');
        setGameSetting(setting);
        setStory([{ id: Date.now(), speaker: 'system', text: `Создание нового мира (${setting}) для ${name}...` }]);
        setPlayerState({ health: 100, inventory: [] });
        
        try {
            const initialResponse = await geminiService.startNewGame(setting);
            setStory([{ id: Date.now(), speaker: 'gemini', text: initialResponse.storyText }]);
            setPlayerState({ health: initialResponse.health, inventory: initialResponse.inventory });
            setGameState('PLAYING');
        } catch (error) {
            handleError(error);
        }
    }, []);
    
    const handleContinueGame = useCallback((name: string) => {
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
            const newGeminiEntry: StoryEntry = { id: Date.now() + 1, speaker: 'gemini', text: response.storyText };
            
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
            <Header onNewGame={() => playerName && handleNewGame(playerName, gameSetting)} onLogout={handleLogout} isLoading={gameState === 'LOADING'} playerName={playerName} />
            <div className="flex-grow flex flex-row overflow-hidden">
                <PlayerStats playerState={playerState} />
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
