import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui';
import { TabbarMenu } from '@/components/TabbarMenu/TabbarMenu';
import './ChatPage.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp?: Date;
}

export const ChatPage: FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: '🌱 Привет! Я ваш AI-агроном-помощник. Чем могу помочь в садоводстве?', 
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.reply || 'Извините, я не получил ответа.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Ошибка связи с сервером.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Page>
      <div className="chat-page">
        <div className="chat-header">
          <div className="chat-avatar-wrapper">
            <div className="chat-avatar assistant-avatar">🤖</div>
          </div>
          <div className="chat-info">
            <h2 className="chat-title">AI Агроном</h2>
            <p className="chat-status">Онлайн</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              {msg.sender === 'assistant' && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-content">
                <div className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
                {msg.timestamp && (
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="message assistant typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Спросите о растениях..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            className="chat-send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            ➤
          </Button>
        </div>
      </div>
    </Page>
  );
};
