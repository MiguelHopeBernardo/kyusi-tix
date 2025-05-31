
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const KyusiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m KyusiChat, your PUPQC virtual assistant. How may I help you with your inquiries about PUP Quezon City today?',
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
  
  const callChatAPI = async (userMessage: string): Promise<string> => {
    try {
      console.log('Sending message to Django backend:', userMessage);
      
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
      
      return data.response || 'I apologize, but I\'m having trouble processing your request. Please try asking about PUPQC enrollment, programs, or other university services.';
    } catch (error) {
      console.error('Chat API error:', error);
      
      if (error instanceof Error) {
        return error.message.includes('Rate limit') 
          ? error.message
          : 'I\'m currently experiencing technical difficulties. For immediate assistance, please contact PUPQC directly at (02) 8287-1717 or visit www.pup.edu.ph.';
      }
      
      return 'I\'m currently experiencing technical difficulties. For immediate assistance, please contact PUPQC directly at (02) 8287-1717 or visit www.pup.edu.ph.';
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
      // Get AI response from Django backend
      const aiResponse = await callChatAPI(currentInput);
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: 'I apologize for the technical difficulty. Please try again or contact PUPQC directly for assistance.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KyusiChat</h2>
          <p className="text-muted-foreground">
            PUPQC AI Assistant powered by Gemini
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
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
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
