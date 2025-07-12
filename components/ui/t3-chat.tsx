"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  Search,
  Bot,
  User,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Code,
  Lightbulb,
  Compass,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface T3ChatProps {
  className?: string;
}

export function T3Chat({ className }: T3ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Auto-resize textarea back to original size
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const { sendAIMessage } = await import("@/app/actions/ai-chat");
      const response = await sendAIMessage(userMessage.content);

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: response.output || "متاسفم، در حال حاضر قادر به پاسخگویی نیستم.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const categories = [
    { icon: Compass, label: "وضعیت تجهیزات", color: "text-blue-400" },
    { icon: Sparkles, label: "ثبت درخواست", color: "text-purple-400" },
    { icon: BookOpen, label: "نگهداری پیشگیرانه", color: "text-orange-400" },
    { icon: Code, label: "گزارش‌ها", color: "text-green-400" },
  ];

  const suggestions = [
    "وضعیت تجهیزات را بررسی کن",
    "یک درخواست تعمیر جدید ثبت کن",
    "برنامه نگهداری پیشگیرانه را نشان بده",
    "گزارش عملکرد تجهیزات را بده",
  ];

  const isEmpty = messages.length === 0;

  return (
    <div className={cn(
      "flex flex-col h-screen max-h-screen bg-background text-foreground",
      className
    )}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            {/* Welcome Message */}
            <div className="text-center mb-12">
              <h1 className="text-2xl md:text-3xl font-medium mb-8 text-foreground">
                چطور می‌تونم کمکتون کنم؟
              </h1>
              
              {/* Category Buttons */}
              <div className="flex gap-4 justify-center mb-12">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/50 transition-colors min-w-[80px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <category.icon className={cn("w-5 h-5", category.color)} />
                    <span className="text-sm text-muted-foreground">{category.label}</span>
                  </motion.button>
                ))}
              </div>
              
              {/* Suggestion Prompts */}
              <div className="space-y-3 max-w-md mx-auto">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full p-3 text-sm text-muted-foreground border border-border rounded-lg hover:border-primary/20 hover:bg-muted/50 transition-colors text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3 group",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-card border border-border">
                        <Bot className="w-4 h-4 text-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "flex flex-col max-w-[70%]",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "relative px-4 py-3 rounded-2xl",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    )}>
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-card border border-border">
                        <User className="w-4 h-4 text-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-card border border-border">
                    <Bot className="w-4 h-4 text-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">در حال تایپ...</span>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-xl mx-auto">
          {/* Main Input Container */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="پیام خود را اینجا بنویسید..."
              className="min-h-[120px] max-h-[300px] resize-none bg-card border-border focus:border-primary/50 text-foreground placeholder-muted-foreground rounded-xl pr-4 pl-12"
              disabled={isTyping}
            />
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              size="sm"
              className="absolute left-2 bottom-2 h-8 w-8 p-0 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 