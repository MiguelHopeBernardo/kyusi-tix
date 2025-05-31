
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const GEMINI_API_KEY = 'AIzaSyCN4jVFK_RS4wX6w3kujYJU5HvHxsDsoYs';

const PUPQC_CONTEXT = `You are KyusiChat, the official AI assistant for Polytechnic University of the Philippines - Quezon City (PUPQC). 

IMPORTANT INSTRUCTIONS:
- Only answer questions related to PUP Quezon City (PUPQC)
- If a question is not related to PUPQC, politely redirect the conversation back to PUPQC topics
- Provide accurate, helpful information about PUPQC services, programs, enrollment, admissions, etc.
- Be friendly but professional
- Keep responses concise and informative

PUPQC KNOWLEDGE BASE:
- Location: San Bartolome, Novaliches, Quezon City
- Contact: (02) 8287-1717, info@pup.edu.ph, www.pup.edu.ph
- Programs: BS Information Technology, BS Business Administration, BS Accountancy, BS Elementary Education, BS Secondary Education, BS Entrepreneurship, and more
- Admission: PUPCET (PUP College Entrance Test) required, applications usually January-February
- Tuition: PHP 1,000-1,500 per semester (very affordable state university)
- Requirements: Form 138, Good Moral Certificate, Birth Certificate, 2x2 photos, Entrance Exam Results
- Services: Student Information System (SIS) for grades and schedules, various scholarship programs
- Events: University Week, Foundation Day, departmental seminars, sports festivals, cultural shows`;

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
  
  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${PUPQC_CONTEXT}\n\nUser question: ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I\'m having trouble processing your request. Please try asking about PUPQC enrollment, programs, or other university services.';
    } catch (error) {
      console.error('Gemini API error:', error);
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
    setInput('');
    setIsTyping(true);
    
    try {
      // Get AI response from Gemini
      const aiResponse = await callGeminiAPI(input);
      
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
