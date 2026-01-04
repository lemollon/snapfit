'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageCircle, Send, X, Loader2, Sparkles, Check,
  Dumbbell, Utensils, Droplets, Trophy, Timer, Mic, MicOff
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';

interface ParsedAction {
  type: 'workout' | 'food' | 'habit' | 'pr' | 'timer' | 'recipe' | 'unknown';
  data: Record<string, any>;
  message: string;
  confidence: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: ParsedAction;
  timestamp: Date;
}

const ACTION_ICONS = {
  workout: Dumbbell,
  food: Utensils,
  habit: Droplets,
  pr: Trophy,
  timer: Timer,
  recipe: Utensils,
  unknown: MessageCircle,
};

const ACTION_COLORS = {
  workout: 'from-violet-500 to-purple-600',
  food: 'from-green-500 to-emerald-600',
  habit: 'from-blue-500 to-cyan-600',
  pr: 'from-amber-500 to-orange-600',
  timer: 'from-rose-500 to-pink-600',
  recipe: 'from-lime-500 to-green-600',
  unknown: 'from-gray-500 to-gray-600',
};

export default function AIChatBar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingAction, setPendingAction] = useState<ParsedAction | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    triggerHaptic('light');
    setIsOpen(true);
  };

  const handleClose = () => {
    triggerHaptic('light');
    setIsOpen(false);
  };

  const processInput = async (text: string) => {
    if (!text.trim()) return;

    triggerHaptic('medium');
    setIsProcessing(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });

      if (response.ok) {
        const result = await response.json();

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.message,
          action: result.action,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (result.action && result.action.type !== 'unknown') {
          setPendingAction(result.action);
          triggerHaptic('success');
        }
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't understand that. Try something like 'Log 8 glasses of water' or 'I benched 225 for 5 reps'",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI parse error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    triggerHaptic('success');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: pendingAction }),
      });

      if (response.ok) {
        const result = await response.json();

        const confirmMessage: ChatMessage = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: result.message || 'Done! ✓',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);

        // Celebration animation
        triggerHaptic('success');
      }
    } catch (error) {
      console.error('Execute error:', error);
    } finally {
      setPendingAction(null);
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    triggerHaptic('light');
    setPendingAction(null);
    const cancelMessage: ChatMessage = {
      id: `cancel-${Date.now()}`,
      role: 'assistant',
      content: "No problem! What else can I help with?",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processInput(input);
    }
  };

  // Voice input (Web Speech API)
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    triggerHaptic('medium');

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      processInput(transcript);
    };

    recognition.start();
  };

  const ActionIcon = pendingAction ? ACTION_ICONS[pendingAction.type] : MessageCircle;
  const actionColor = pendingAction ? ACTION_COLORS[pendingAction.type] : 'from-violet-500 to-purple-600';

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">SnapFit AI</h3>
                  <p className="text-xs text-white/50">Log anything with natural language</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4 opacity-50" />
                  <p className="text-white/60 mb-4">Try saying something like:</p>
                  <div className="space-y-2">
                    {[
                      '"I drank 5 glasses of water"',
                      '"Benched 225 for 5 reps - new PR!"',
                      '"Had a chicken salad for lunch"',
                      '"Start a 20 minute AMRAP timer"',
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(example.replace(/"/g, ''))}
                        className="block w-full text-sm text-white/40 hover:text-white/80 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>

                    {/* Action Preview */}
                    {message.action && message.action.type !== 'unknown' && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-2 text-xs opacity-80">
                          {(() => {
                            const Icon = ACTION_ICONS[message.action.type];
                            return <Icon className="w-3 h-3" />;
                          })()}
                          <span className="capitalize">{message.action.type}</span>
                          <span className="ml-auto">{Math.round(message.action.confidence * 100)}% confident</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Pending Action Confirmation */}
              {pendingAction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gradient-to-r ${actionColor} rounded-2xl p-4`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <ActionIcon className="w-6 h-6 text-white" />
                    <span className="font-semibold text-white capitalize">{pendingAction.type}</span>
                  </div>

                  <div className="bg-black/20 rounded-xl p-3 mb-3">
                    <pre className="text-xs text-white/80 whitespace-pre-wrap">
                      {JSON.stringify(pendingAction.data, null, 2)}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={cancelAction}
                      className="flex-1 py-2 bg-white/20 rounded-xl text-white font-medium hover:bg-white/30 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction}
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-white rounded-xl text-gray-900 font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Confirm
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoice}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me what you did..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isProcessing}
                />

                <button
                  onClick={() => processInput(input)}
                  disabled={!input.trim() || isProcessing}
                  className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {[
                  { label: '💧 Water', action: 'Log 1 glass of water' },
                  { label: '🏋️ Workout', action: 'Log workout' },
                  { label: '🍽️ Meal', action: 'Log my meal' },
                  { label: '⏱️ Timer', action: 'Start timer' },
                ].map((quick) => (
                  <button
                    key={quick.label}
                    onClick={() => {
                      setInput(quick.action);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
