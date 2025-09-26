import React from 'react';

interface GameOverScreenProps {
    onReturnToMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onReturnToMenu }) => {
    return (
        <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-red-500/30 sticky bottom-0">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-2 font-mono">Игра окончена</h2>
                <p className="text-gray-400 mb-4 font-mono">Ваше приключение подошло к концу.</p>
                <button
                    onClick={onReturnToMenu}
                    className="px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors"
                >
                    Вернуться в меню
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;
