
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

// Mock responses based on keywords
const mockResponses: Record<string, string> = {
  'hello': 'Hello! How can I assist you with your inquiries about PUP Quezon City today?',
  'hi': 'Hi there! I\'m KyusiChat, your PUPQC virtual assistant. How may I help you?',
  'enroll': 'To enroll at PUP Quezon City, you need to follow these steps:\n\n1. Check the official PUP website for enrollment schedules\n2. Complete the online registration form\n3. Submit required documents\n4. Pay the enrollment fee\n5. Attend the orientation\n\nFor more details, visit the official PUP website or contact the registrar\'s office.',
  'admission': 'The admission process for PUP Quezon City involves taking the PUPCET (PUP College Entrance Test). Applications usually start around January to February each year. Visit the official PUP website for the exact dates and requirements.',
  'schedule': 'Class schedules are released after the enrollment period. You can check your schedule through the PUP Student Information System (SIS) using your student credentials.',
  'requirements': 'General requirements for admission include:\n- Form 138 (High School Report Card)\n- Certificate of Good Moral Character\n- Birth Certificate\n- 2x2 ID pictures\n- Entrance Exam Results\n\nSpecific programs may have additional requirements.',
  'tuition': 'PUP is one of the most affordable state universities in the Philippines. Tuition fees range from approximately PHP 1,000 to PHP 1,500 per semester, depending on your program. There are also miscellaneous fees for various services.',
  'location': 'PUP Quezon City is located at San Bartolome, Novaliches, Quezon City. It\'s accessible via Commonwealth Avenue and several public transportation routes.',
  'programs': 'PUP Quezon City offers various undergraduate programs including:\n- BS Information Technology\n- BS Business Administration\n- BS Accountancy\n- BS Elementary Education\n- BS Secondary Education\n- BS Entrepreneurship\nand many more.',
  'contact': 'You can contact PUP Quezon City through:\nPhone: (02) 8287-1717\nEmail: info@pup.edu.ph\nWebsite: www.pup.edu.ph',
  'events': 'PUP Quezon City hosts various events throughout the academic year including University Week, Foundation Day celebrations, departmental seminars, sports festivals, and cultural shows. Check the official PUP social media pages for updates.',
  'grades': 'You can check your grades through the PUP Student Information System (SIS). Log in with your student credentials and navigate to the grades section.',
  'scholarship': 'PUP offers various scholarship programs including:\n- Academic Scholars\n- Non-Academic Scholars (sports, cultural)\n- Government Scholarship Programs (CHED, DOST)\n- Private Scholarship Programs\nVisit the Office of Student Services for more information.',
  'default': 'I don\'t have specific information about that. For accurate details, please visit the official PUP website at www.pup.edu.ph or contact the university directly.'
};

const KyusiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m KyusiChat, your PUPQC virtual assistant. How may I help you today?',
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
  
  const handleSendMessage = (e: React.FormEvent) => {
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
    
    // Simulate AI typing
    setTimeout(() => {
      // Generate response based on keywords
      let responseContent = mockResponses.default;
      
      const lowerInput = input.toLowerCase();
      for (const [keyword, response] of Object.entries(mockResponses)) {
        if (lowerInput.includes(keyword)) {
          responseContent = response;
          break;
        }
      }
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KyusiChat</h2>
          <p className="text-muted-foreground">
            PUPQC AI Assistant for FAQs
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
              placeholder="Ask KyusiChat a question..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          <div className="mt-2 text-xs text-muted-foreground">
            Try asking about: enrollment, admission, programs, scholarships, tuition fees
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KyusiChat;
