import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm the Pambo Assistant. How can I help you with buying, selling, or our services today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (userInput.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await chatWithAssistant(userInput);
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget Window */}
      <div className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-blue-800 text-white p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles size={20} />
            <h3 className="font-bold text-lg">Pambo Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    P
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-end gap-2 justify-start">
                   <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-lg font-bold shrink-0">P</div>
                   <div className="p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none border border-gray-200">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                   </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg py-2 pl-4 pr-12 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
            />
            <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 w-16 h-16 bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transform hover:scale-110 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={32} />
      </button>
    </>
  );
};