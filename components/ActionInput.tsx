import React, { useState } from 'react';
import { GameState } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';

interface ActionInputProps {
    onSend: (action: string) => void;
    isLoading: boolean;
    gameState: GameState;
}

const ActionInput: React.FC<ActionInputProps> = ({ onSend, isLoading, gameState }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    if (gameState === 'INITIAL') {
        return null;
    }

    return (
        <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-green-400/20 sticky bottom-0">
             <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="flex items-center space-x-2">
                    {isLoading && <div className="p-3"><LoadingSpinner /></div>}
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isLoading ? "Ожидание решения судьбы..." : "Что вы делаете?"}
                        disabled={isLoading || gameState === 'ERROR'}
                        className="flex-grow bg-gray-700 text-green-300 placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 font-mono w-full"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isLoading || gameState === 'ERROR' || !input.trim()}
                        className="px-6 py-3 bg-green-500 text-gray-900 font-bold rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Отправить
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ActionInput;