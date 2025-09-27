import React from 'react';
import { PlayerState, GameSetting, SETTING_NAMES } from '../types';

interface PlayerStatsProps {
    playerState: PlayerState;
    gameSetting: GameSetting;
}

const HealthBar: React.FC<{ health: number }> = ({ health }) => {
    const healthPercentage = Math.max(0, Math.min(100, health));
    const barColor = healthPercentage > 60 ? 'bg-green-500' : healthPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-base font-medium text-green-300">Здоровье</span>
                <span className="text-sm font-medium text-green-300">{health} / 100</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div 
                    className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${healthPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const PlayerStats: React.FC<PlayerStatsProps> = ({ playerState, gameSetting }) => {
    return (
        <aside className="w-64 bg-gray-800/50 p-4 border-r border-green-400/20 flex-shrink-0 overflow-y-auto font-mono flex flex-col space-y-6">
            <div>
                <h2 className="text-lg font-bold text-green-300 border-b border-green-400/20 pb-2 mb-2">Состояние</h2>
                <div className="text-sm text-yellow-400">
                    <span className="text-gray-400">Мир: </span>{SETTING_NAMES[gameSetting]}
                </div>
            </div>

            <HealthBar health={playerState.health} />
            
            <div>
                <h3 className="text-base font-medium text-green-300 mb-2">Инвентарь</h3>
                {playerState.inventory.length > 0 ? (
                    <ul className="space-y-1 text-gray-300 list-disc list-inside">
                        {playerState.inventory.map((item, index) => (
                            <li key={index} className="truncate">{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic text-sm">Ваш рюкзак пуст.</p>
                )}
            </div>
        </aside>
    );
};

export default PlayerStats;