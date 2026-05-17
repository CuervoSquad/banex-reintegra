import api from './authService';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export const chatService = {
  async send(messages: ChatMessage[]): Promise<string> {
    const { data } = await api.post<{ reply: string }>('/chat', { messages });
    return data.reply;
  },
};
