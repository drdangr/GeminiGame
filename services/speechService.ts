import { GameSetting, Emotion } from '../types';

// Check for browser support
const synth = window.speechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let voices: SpeechSynthesisVoice[] = [];

// Function to load voices. The list is not always available on initial load.
const loadVoices = () => {
    voices = synth.getVoices();
};

// Initial load
loadVoices();
// The 'voiceschanged' event is fired when the list of voices has been loaded.
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

type VoiceProfile = {
    pitch: number;
    rate: number;
};

// Base voice characteristics for each setting
const settingProfiles: Record<GameSetting, VoiceProfile> = {
    FANTASY: { pitch: 0.9, rate: 0.9 },        // velvety, unhurried baritone
    NOIR_DETECTIVE: { pitch: 0.6, rate: 0.85 },   // deep bass
    CYBERPUNK: { pitch: 1.1, rate: 1.1 },      // slightly higher, faster, more synthetic feel
};

// ENHANCED Modifiers to apply on top of the base profile based on emotion
const emotionModifiers: Record<Emotion, VoiceProfile> = {
    neutral: { pitch: 1.0, rate: 1.0 },
    calm:    { pitch: 0.95, rate: 0.9 },
    sad:     { pitch: 0.8, rate: 0.75 }, // Lower pitch, slower rate
    tense:   { pitch: 1.1, rate: 1.15 }, // Higher pitch, faster rate
    action:  { pitch: 1.25, rate: 1.35 }, // Much higher and faster
};

const speak = (text: string, setting: GameSetting, emotion: Emotion, voiceURI?: string | null) => {
    if (!synth) {
        console.warn("Speech synthesis not supported.");
        return;
    }

    // Cancel any ongoing or pending speech before starting a new one
    cancel();

    // Create a new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'ru-RU';

    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (voiceURI) {
        selectedVoice = voices.find(voice => voice.voiceURI === voiceURI);
    }

    if (!selectedVoice) {
        // Find the first available Russian voice as a fallback
        selectedVoice = voices.find(voice => voice.lang === 'ru-RU');
    }
    
    if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
    }
    
    const baseProfile = settingProfiles[setting];
    const modifier = emotionModifiers[emotion] || emotionModifiers.neutral;

    // Apply modifier to base profile
    const finalPitch = baseProfile.pitch * modifier.pitch;
    const finalRate = baseProfile.rate * modifier.rate;
    
    // Add a slight random variation to make it sound more natural
    const randomPitchOffset = (Math.random() - 0.5) * 0.1; // between -0.05 and +0.05
    const randomRateOffset = (Math.random() - 0.5) * 0.05; // between -0.025 and +0.025

    // Clamp values to a reasonable range supported by the API (e.g., 0.1 to 2)
    currentUtterance.pitch = Math.max(0.1, Math.min(2, finalPitch + randomPitchOffset));
    currentUtterance.rate = Math.max(0.1, Math.min(2, finalRate + randomRateOffset));

    // Clear reference on end
    currentUtterance.onend = () => {
        currentUtterance = null;
    };
    
    // Speak
    synth.speak(currentUtterance);
};

const cancel = () => {
    if (synth && (synth.speaking || synth.pending)) {
        synth.cancel();
        currentUtterance = null;
    }
};

const isSpeaking = (): boolean => {
    return synth ? synth.speaking : false;
};

export const speechService = {
    speak,
    cancel,
    isSpeaking,
};
