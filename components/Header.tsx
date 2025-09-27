import React from 'react';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons/SpeakerIcons';

interface HeaderProps {
    onNewGame: () => void;
    onLogout: () => void;
    isLoading: boolean;
    playerName: string | null;
    isTtsEnabled: boolean;
    onToggleTts: () => void;
    availableVoices: SpeechSynthesisVoice[];
    selectedVoiceURI: string | null;
    onVoiceChange: (uri: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onNewGame, 
    onLogout, 
    isLoading, 
    playerName, 
    isTtsEnabled, 
    onToggleTts,
    availableVoices,
    selectedVoiceURI,
    onVoiceChange,
}) => {
    return (
        <header className="flex justify-between items-center p-4 bg-gray-800/50 backdrop-blur-sm border-b border-green-400/20 sticky top-0 z-10">
            <h1 className="text-xl sm:text-2xl font-bold text-green-300 font-mono tracking-wider">
                Gemini Adventure
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
                {playerName && <span className="hidden sm:inline text-gray-400 font-mono">Игрок: <span className="font-bold text-green-300">{playerName}</span></span>}
                
                {isTtsEnabled && availableVoices.length > 0 && (
                    <select
                        value={selectedVoiceURI || ''}
                        onChange={(e) => onVoiceChange(e.target.value)}
                        className="bg-gray-700 text-green-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-sm"
                        aria-label="Выбрать голос озвучки"
                    >
                        <option value="">Голос по умолчанию</option>
                        {availableVoices.map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name}
                            </option>
                        ))}
                    </select>
                )}

                <button
                    onClick={onToggleTts}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
                    title={isTtsEnabled ? "Выключить озвучку" : "Включить озвучку"}
                    aria-label={isTtsEnabled ? "Выключить озвучку" : "Включить озвучку"}
                >
                    {isTtsEnabled ? <SpeakerOnIcon className="h-6 w-6" /> : <SpeakerOffIcon className="h-6 w-6" />}
                </button>
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