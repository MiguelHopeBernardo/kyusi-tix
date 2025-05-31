
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { ChatService } from '@/services/chatService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  hasTicketOption?: boolean;
}

const KyusiChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m KyusiChat, your PUPQC virtual assistant. I can help you with questions about enrollment, admission, programs, tuition fees, and other university services. How may I assist you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      console.log('Sending message to Django backend (Gemini fallback):', userMessage);
      
      const response = await fetch('http://127.0.0.1:8000/chat/ask/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          user_id: user?.id
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before asking another question.');
        }
        throw new Error('Failed to get response from chat service');
      }

      const data = await response.json();
      console.log('Response from Django backend:', data);
      
      return data.response || 'I apologize, but I\'m having trouble processing your request.';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    
    try {
      // First, try rule-based response
      const ruleBasedResult = ChatService.getRuleBasedResponse(currentInput);
      
      if (ruleBasedResult.isRuleBased) {
        console.log('Using rule-based response');
        const aiMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: ruleBasedResult.response,
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback to Gemini API
        console.log('Using Gemini API fallback');
        try {
          const aiResponse = await callGeminiAPI(currentInput);
          
          const aiMessage: Message = {
            id: `assistant-${Date.now()}`,
            content: aiResponse,
            sender: 'assistant',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } catch (geminiError) {
          console.error('Gemini API failed:', geminiError);
          
          // If Gemini fails, provide fallback message with ticket option
          const fallbackMessage: Message = {
            id: `assistant-${Date.now()}`,
            content: "I apologize, but I can't answer that question. For immediate assistance, please contact PUPQC directly at (02) 8287-1717 or create a ticket here for personalized support.",
            sender: 'assistant',
            timestamp: new Date(),
            hasTicketOption: true,
          };
          
          setMessages(prev => [...prev, fallbackMessage]);
        }
      }
    } catch (error) {
      console.error('Error in chat handling:', error);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: 'I apologize for the technical difficulty. Please try again or contact PUPQC directly for assistance at (02) 8287-1717.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.hasTicketOption) {
      const parts = message.content.split('here');
      if (parts.length === 2) {
        return (
          <div className="whitespace-pre-wrap break-words">
            {parts[0]}
            <button 
              onClick={() => navigate('/tickets')}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              here
            </button>
            {parts[1]}
          </div>
        );
      }
    }
    return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KyusiChat</h2>
          <p className="text-muted-foreground">
            PUPQC AI Assistant with Smart Responses
          </p>
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                } items-start space-x-2 ${message.sender === 'user' ? 'space-x-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  {message.sender === 'user' ? (
                    <>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="https://www.pup.edu.ph/about/images/PUPLogo.png" />
                      <AvatarFallback>K</AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div
                  className={`py-2 px-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {renderMessageContent(message)}
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://www.pup.edu.ph/about/images/PUPLogo.png" />
                  <AvatarFallback>K</AvatarFallback>
                </Avatar>
                <div className="py-2 px-3 rounded-lg bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about PUPQC enrollment, programs, admissions..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          <div className="mt-2 text-xs text-muted-foreground">
            Ask about: enrollment, admission, programs, scholarships, tuition fees, campus location
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KyusiChat;
