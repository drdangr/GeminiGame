import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, StoryEntry, PlayerState, SavedGame } from './types';
import * as geminiService from './services/geminiService';
import Header from './components/Header';
import StoryDisplay from './components/StoryDisplay';
import ActionInput from './components/ActionInput';
import AuthScreen from './components/AuthScreen';
import PlayerStats from './components/PlayerStats';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('UNAUTHENTICATED');
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
                const gameToSave: SavedGame = { story, playerState };
                localStorage.setItem(`gemini_adventure_${playerName}`, JSON.stringify(gameToSave));
            } catch (error) {
                console.error("Failed to save game:", error);
            }
        }
    }, [story, playerState, playerName, gameState]);

    const handleNewGame = useCallback(async (name: string) => {
        setPlayerName(name);
        setGameState('LOADING');
        setStory([{ id: Date.now(), speaker: 'system', text: 'Создание нового мира для ' + name + '...' }]);
        setPlayerState({ health: 100, inventory: [] });
        
        try {
            const initialResponse = await geminiService.startNewGame();
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
                setPlayerName(name);
                setStory(savedGame.story);
                setPlayerState(savedGame.playerState);
                setGameState('PLAYING');
            } else {
                // If no save found, start a new game for them.
                handleNewGame(name);
            }
        } catch (error) {
            console.error("Failed to load game:", error);
            // If loading fails, start a new game.
            handleNewGame(name);
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
            setGameState('PLAYING');
        } catch (error) {
            handleError(error);
        }
    }, [gameState, playerState]);
    
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
            <Header onNewGame={() => playerName && handleNewGame(playerName)} onLogout={handleLogout} isLoading={gameState === 'LOADING'} playerName={playerName} />
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
            <ActionInput onSend={handleSendAction} isLoading={gameState === 'LOADING'} gameState={gameState} />
        </div>
    );
};

export default App;
