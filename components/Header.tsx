import React from 'react';

interface HeaderProps {
    onNewGame: () => void;
    onLogout: () => void;
    isLoading: boolean;
    playerName: string | null;
}

const Header: React.FC<HeaderProps> = ({ onNewGame, onLogout, isLoading, playerName }) => {
    return (
        <header className="flex justify-between items-center p-4 bg-gray-800/50 backdrop-blur-sm border-b border-green-400/20 sticky top-0 z-10">
            <h1 className="text-xl sm:text-2xl font-bold text-green-300 font-mono tracking-wider">
                Gemini Adventure
            </h1>
            <div className="flex items-center space-x-4">
                {playerName && <span className="text-gray-400 font-mono">Игрок: <span className="font-bold text-green-300">{playerName}</span></span>}
                <button
                    onClick={onNewGame}
                    disabled={isLoading || !playerName}
                    className="px-4 py-2 bg-green-500 text-gray-900 font-bold rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Новая игра
                </button>
                 {playerName && (
                    <button
                        onClick={onLogout}
                        disabled={isLoading}
                        className="px-4 py-2 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Выйти
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
