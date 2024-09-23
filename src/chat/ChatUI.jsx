import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize OpenAI client with API key from environment variable
  const openai = new OpenAI({ apiKey: import.meta.env.PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

  useEffect(() => {
    // Fetch system prompt and hyperparameters from backend
    fetchSystemPromptAndParams();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSystemPromptAndParams = async () => {
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/chat-config');
      const data = await response.json();
      setSystemPrompt(data.systemPrompt);
      setTemperature(data.temperature);
      setMaxTokens(data.maxTokens);
    } catch (error) {
      console.error('Error fetching chat configuration:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
          userMessage,
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      });

      const assistantMessage = { role: 'assistant', content: response.choices[0].message.content };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { role: 'error', content: 'An error occurred. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-grow overflow-auto mb-4 border rounded p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-l"
        />
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded-r">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatUI;
