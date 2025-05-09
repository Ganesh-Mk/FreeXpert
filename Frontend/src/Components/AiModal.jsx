import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // For backend communication

export default function AIChatbot() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', content: 'Hello! How can I assist you with your learning today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const location = useLocation();
  const textAreaRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  // Check if current path should show the AI chatbot
  useEffect(() => {
    const visiblePaths = ['/learn', '/chatting', '/community', '/news'];
    const shouldBeVisible = visiblePaths.some(path => 
      location.pathname.startsWith(path));
    
    setIsVisible(shouldBeVisible);
  }, [location.pathname]);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const openModal = () => {
    setIsModalOpen(true);
    // Focus the input after opening modal
    setTimeout(() => textAreaRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    console.log('Sending message:', message);
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', content: message }]);
    
    // Clear message input
    setMessage('');
    
    // Reset textarea height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Send message to backend API
      const response = await axios.post(`${BACKEND_URL}/getAIResponse`, {
        prompt: message.trim(),
      });
      
      setChatHistory(prev => [...prev, { type: 'ai', content: response.data.response }]);

    } catch (error) {
      // Handle error - add fallback response
      console.error('Error communicating with AI backend:', error);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again in a moment."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating AI Button with pulse animation */}
      <button
        onClick={openModal}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3 group"
        aria-label="Open AI Assistant"
      >
        {/* Pulse animation */}
        <span className="absolute w-full h-full rounded-full bg-blue-500 opacity-75 animate-ping"></span>
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28"
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="relative z-10"
        >
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8 9h8"></path>
          <path d="M8 12h6"></path>
          <path d="M11 15h2"></path>
          <path d="M16 9v6"></path>
        </svg>
        
        {/* Tooltip */}
        <span className="absolute left-20 bg-gray-800 text-white text-sm px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Learning Assistant
        </span>
      </button>

      {/* AI Modal Component - Wider Screen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 h-5/6 flex flex-col overflow-hidden transform transition-all animate-scaleIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M8 9h8"></path>
                    <path d="M8 12h6"></path>
                    <path d="M11 15h2"></path>
                    <path d="M16 9v6"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Learning Assistant AI</h3>
                  <p className="text-blue-100 text-sm">Powered by advanced AI technology</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="text-white hover:text-gray-200 focus:outline-none transition-transform hover:rotate-90 duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-grow p-6 overflow-y-auto bg-gray-50">
              <div className="space-y-6 max-w-3xl mx-auto">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'ai' && (
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-2.5 mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M8 9h8"></path>
                          <path d="M8 12h6"></path>
                          <path d="M11 15h2"></path>
                          <path d="M16 9v6"></path>
                        </svg>
                      </div>
                    )}
                    <div className={`p-4 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md max-w-lg' 
                        : 'bg-white border shadow-sm rounded-bl-none max-w-2xl'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.type === 'user' && (
                      <div className="flex-shrink-0 bg-blue-600 rounded-full p-2.5 ml-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2.5 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M8 9h8"></path>
                        <path d="M8 12h6"></path>
                        <path d="M11 15h2"></path>
                        <path d="M16 9v6"></path>
                      </svg>
                    </div>
                    <div className="bg-white border p-4 rounded-lg rounded-bl-none shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>
            
            {/* Input area */}
            <div className="border-t px-6 py-4 bg-white">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end space-x-3">
                  <div className="flex-grow relative bg-gray-100 rounded-2xl">
                    <textarea
                      ref={textAreaRef}
                      rows="1"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything about your learning journey..."
                      className="w-full py-3 px-4 bg-transparent rounded-2xl focus:outline-none resize-none overflow-hidden max-h-32"
                    />
                    <div className="absolute right-3 bottom-2.5 text-xs text-gray-400">
                      <span>Shift+Enter for new line</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-3 rounded-full flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      message.trim() 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <div>
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      Use clear, specific questions for best results
                    </span>
                  </div>
                  <div>
                    <button className="text-blue-600 hover:underline focus:outline-none">
                      Clear conversation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}