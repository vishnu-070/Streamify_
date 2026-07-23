import { StreamChat } from 'stream-chat';

export const streamClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY || 'n5psykq5nde3');
