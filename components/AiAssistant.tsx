
import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path.
import { ChatMessage } from '../types';
import { hrAssistant } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';

const AiAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'Hello! I am your AI HR Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponseText = await hrAssistant.sendMessage(input);
        
        const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                AI
                            </div>
                        )}
                        <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                You
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                AI
                        </div>
                        <div className="max-w-lg p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                           <div className="flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse ml-1 delay-75"></span>
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse ml-1 delay-150"></span>
                           </div>
                        </div>
                     </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about HR policies, best practices..."
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading} className="rounded-l-none">
                    Send
                </Button>
            </div>
        </Card>
    );
};

export default AiAssistant;