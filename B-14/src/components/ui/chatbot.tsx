
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import { chat } from '@/ai/flows/chatbot';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  feedback?: 'good' | 'bad';
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: "Hello! I'm CareerCompass AI. How can I help you with your career journey today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc(userProfileRef);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat({
        message: input,
        userProfile: {
          skills: userProfile?.skills,
          education: userProfile?.education,
          goals: userProfile?.goals,
        }
      });
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: result.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chatbot error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'good' | 'bad') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    toast({
      title: "Feedback Submitted",
      description: "Thank you for helping us improve!",
    });
    // Here you would typically send this feedback to your backend/analytics
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
       <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="flex items-center gap-2 font-headline text-xl"><Bot /> CareerCompass AI</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-3xl mx-auto w-full">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col gap-2 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex w-full items-start gap-3 ${message.sender === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                  {message.sender === 'bot' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] w-auto ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm" style={{ wordBreak: 'break-word' }}>{message.text}</p>
                  </div>
                </div>
                {message.sender === 'bot' && !message.feedback && (
                   <div className="flex gap-2 ml-11">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback(message.id, 'good')}>
                          <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback(message.id, 'bad')}>
                          <ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                   </div>
                )}
                 {message.feedback === 'good' && (
                    <div className="flex gap-1 items-center ml-11 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs">Helpful</span>
                    </div>
                 )}
                 {message.feedback === 'bad' && (
                    <div className="flex gap-1 items-center ml-11 text-red-600">
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-xs">Not helpful</span>
                    </div>
                 )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 max-w-3xl mx-auto w-full">
                <Avatar className="w-8 h-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-3xl mx-auto w-full">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about careers..."
              autoComplete="off"
              disabled={isLoading}
              className="flex-1 resize-none max-h-48 overflow-y-auto bg-card"
              rows={1}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </div>
  );
}
