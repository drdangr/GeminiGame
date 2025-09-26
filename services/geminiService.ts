import { GoogleGenAI, Chat, Type } from '@google/genai';
import { PlayerState, GeminiResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

const SYSTEM_INSTRUCTION = `Ты — динамичный и креативный мастер текстовых приключенческих игр. Твоё имя — Gemini.
- Ты ПОЛНОСТЬЮ управляешь состоянием игрока: его здоровьем и инвентарем.
- Твой ответ ВСЕГДА ДОЛЖЕН БЫТЬ в формате JSON, соответствующем предоставленной схеме.
- В поле 'storyText' ты создаешь захватывающую, интерактивную историю в жанре высокого фэнтези. Увлекательно описывай результат действий пользователя, новую сцену и побуждай к следующему действию. Текст должен быть из 2-4 абзацев.
- В поле 'health' ты устанавливаешь НОВОЕ значение здоровья игрока. Если игрок получает урон, уменьшай его. Если лечится - увеличивай.
- В поле 'inventory' ты возвращаешь ПОЛНЫЙ, ОБНОВЛЕННЫЙ список предметов игрока. Если игрок находит предмет, добавь его. Если теряет или использует - удали.
- Сюжет должен зависеть от инвентаря и здоровья. Если у игрока есть нужный предмет, опиши, как он его использует. Если здоровье низкое, опиши слабость персонажа.
- История может закончиться смертью (health <= 0).
- Никогда не выходи из роли. Ты — мастер игры, а не модель ИИ.
- Начни игру с захватывающего сценария, где пользователю нужно немедленно действовать.
- ВСЕГДА отвечай на русском языке.`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        storyText: { type: Type.STRING, description: 'Текст истории для игрока.' },
        health: { type: Type.NUMBER, description: 'Новое, обновленное значение здоровья игрока.' },
        inventory: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Полный, обновленный список предметов в инвентаре игрока.'
        },
    },
    required: ['storyText', 'health', 'inventory'],
};

const parseGeminiResponse = (responseText: string): GeminiResponse => {
    try {
        // Gemini might wrap the JSON in ```json ... ```, so we need to clean it.
        const cleanedText = responseText.replace(/^```json\s*|```$/g, '').trim();
        return JSON.parse(cleanedText) as GeminiResponse;
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", responseText);
        throw new Error("Получен некорректный ответ от игрового мастера. Не удалось разобрать JSON.");
    }
}

export const startNewGame = async (): Promise<GeminiResponse> => {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  const response = await chat.sendMessage({ message: "Начать новое приключение. Игрок имеет 100 здоровья и пустой инвентарь." });
  return parseGeminiResponse(response.text);
};

export const sendAction = async (action: string, playerState: PlayerState): Promise<GeminiResponse> => {
  if (!chat) {
    throw new Error("Game not started. Call startNewGame first.");
  }
  const prompt = `
    Действие игрока: "${action}"

    Текущее состояние:
    - Здоровье: ${playerState.health}
    - Инвентарь: [${playerState.inventory.join(', ')}]
    `;

  const response = await chat.sendMessage({ message: prompt });
  return parseGeminiResponse(response.text);
};
