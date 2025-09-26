import React, { useState } from 'react';

interface AuthScreenProps {
    onNewGame: (name: string) => void;
    onContinue: (name: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onNewGame, onContinue }) => {
    const [name, setName] = useState('');

    const handleNewGameClick = () => {
        if (name.trim()) {
            onNewGame(name.trim());
        }
    };

    const handleContinueClick = () => {
        if (name.trim()) {
            onContinue(name.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && name.trim()) {
            onContinue(name.trim());
        }
    };

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col justify-center items-center text-center p-8 font-mono">
             <h1 className="text-4xl sm:text-5xl font-bold text-green-300 font-mono tracking-wider mb-8 animate-pulse">
                Gemini Adventure
            </h1>
            <p className="text-gray-400 max-w-lg mb-8">
                Введите имя вашего героя, чтобы сохранить прогресс и продолжить свои странствия в будущем.
            </p>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Имя героя"
                className="bg-gray-700 text-green-300 placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 font-mono w-full max-w-sm mb-4 text-center text-lg"
                autoFocus
            />
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={handleContinueClick}
                    disabled={!name.trim()}
                    className="px-8 py-4 bg-green-500 text-gray-900 font-bold text-lg rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Продолжить
                </button>
                <button
                    onClick={handleNewGameClick}
                    disabled={!name.trim()}
                    className="px-8 py-4 bg-yellow-500 text-gray-900 font-bold text-lg rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Новая игра
                </button>
            </div>
             <p className="text-gray-500 max-w-lg mt-8 text-sm">
                Если игра с таким именем существует, "Продолжить" загрузит её. "Новая игра" перезапишет старое сохранение.
            </p>
        </div>
    );
};

export default AuthScreen;
