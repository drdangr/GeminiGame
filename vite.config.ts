import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Загружаем переменные окружения из .env файлов
    const env = loadEnv(mode, process.cwd(), '');
    
    console.log('Loading environment variables...');
    console.log('VITE_GEMINI_API_KEY from env:', env.VITE_GEMINI_API_KEY ? 'Found' : 'Not found');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Явно определяем переменную для клиента
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
