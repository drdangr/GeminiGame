
import React from 'react';
import { StoryEntry } from '../types';

interface StoryDisplayProps {
    story: StoryEntry[];
    storyEndRef: React.RefObject<HTMLDivElement>;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, storyEndRef }) => {
    
    const getSpeakerClasses = (speaker: StoryEntry['speaker']): string => {
        switch (speaker) {
            case 'gemini':
                return 'text-gray-300 leading-relaxed';
            case 'user':
                return 'text-green-300 font-semibold italic';
            case 'system':
                return 'text-yellow-400 text-center italic';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto font-mono">
            <div className="max-w-3xl mx-auto space-y-6">
                {story.map((entry) => (
                    <div key={entry.id} className={getSpeakerClasses(entry.speaker)}>
                        {entry.speaker === 'user' && <span className="mr-2">&gt;</span>}
                        <div>
                            {entry.text.split('\n').map((line, i) => (
                                <p key={i} className={line.trim() === '' ? 'h-4' : ''}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div ref={storyEndRef} />
        </div>
    );
};

export default StoryDisplay;
