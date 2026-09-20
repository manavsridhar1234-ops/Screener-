import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, X, ChevronDown, ChevronUp, MessageSquare, AlertCircle, Lightbulb } from 'lucide-react';
import type { NormalizedStock, PeerBenchmarkData, FinancialGrowthPoint, ChatMessage } from '../../types';
import { useExperience } from '../../context/ExperienceContext';
import { askStockAiApi } from '../../services/api';

interface StockAiChatProps {
  stock: NormalizedStock;
  benchmarkData?: PeerBenchmarkData | null;
  growthSeries?: FinancialGrowthPoint[];
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string | null;
  onClearInitialQuestion?: () => void;
}

export const StockAiChat: React.FC<StockAiChatProps> = ({
  stock,
  benchmarkData,
  growthSeries = [],
  isOpen,
  onClose,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const { experienceLevel, toggleExperienceLevel } = useExperience();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested prompts based on experience level
  const suggestedPrompts = experienceLevel === 'beginner'
    ? [
        `Is ${stock.symbol} cheap or expensive right now?`,
        `Does ${stock.companyName} have too much debt?`,
        `How does it make money and what are its profit margins?`,
        `Explain its Free Cash Flow in simple terms`,
      ]
    : [
        `Analyze ${stock.symbol}'s valuation multiples vs sector percentiles`,
        `Assess balance sheet solvency, interest coverage, and net debt`,
        `Evaluate multi-year revenue CAGR and FCF conversion quality`,
        `What are the primary structural risks and downside catalysts?`,
      ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming initial questions from MetricExplainer
  useEffect(() => {
    if (initialQuestion && isOpen) {
      sendMessage(initialQuestion);
      if (onClearInitialQuestion) onClearInitialQuestion();
    }
  }, [initialQuestion, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setError(null);
    setInputValue('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const historyForApi = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const answer = await askStockAiApi({
        symbol: stock.symbol,
        question: query,
        history: historyForApi,
        experienceLevel,
        stock,
        benchmarkData,
        growthSeries,
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to get a response from AI analyst.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div
      id="stock-ai-chat-panel"
      className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[460px] max-h-[85vh] h-[640px] flex flex-col bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-slate-100">
                AI Stock Analyst
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {stock.symbol}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ask anything about financials, valuation, or risks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Experience level toggle */}
          <button
            type="button"
            onClick={toggleExperienceLevel}
            title={`Current mode: ${experienceLevel === 'beginner' ? 'Beginner' : 'Pro'}. Click to switch.`}
            className={`px-2 py-1 text-[11px] font-medium rounded-lg border transition-all ${
              experienceLevel === 'beginner'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20'
            }`}
          >
            {experienceLevel === 'beginner' ? 'Beginner' : 'Pro Analyst'}
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              title="Clear chat"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center px-4 space-y-4 my-auto py-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                Ask anything about {stock.companyName}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Powered by real SEC filings, live multiples, and sector percentiles. Mode:{' '}
                <span className="text-sky-300 font-medium">
                  {experienceLevel === 'beginner' ? 'Beginner (Simple & Intuitive)' : 'Pro (Institutional depth)'}
                </span>.
              </p>
            </div>

            {/* Quick suggested chips */}
            <div className="w-full space-y-1.5 pt-2 text-left">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Suggested questions:
              </span>
              <div className="flex flex-col gap-1.5">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="p-2 text-left text-xs bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all duration-150"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                {/* Render simple markdown lines */}
                <div className="space-y-1.5">
                  {m.content.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={idx} className="h-1" />;
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="font-semibold text-slate-100 text-xs pt-1">
                          {trimmed.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (trimmed.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{trimmed.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 w-fit animate-pulse">
            <Bot className="w-4 h-4 text-sky-400 animate-spin" />
            <span className="text-xs">Analyzing {stock.symbol} financial data...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask about ${stock.symbol} (e.g., Is P/E fair?)...`}
            className="w-full py-2.5 pl-3.5 pr-11 bg-slate-950 border border-slate-800 focus:border-sky-500/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send query"
            className="absolute right-1.5 p-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:hover:bg-sky-600 text-white transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
          <span>Objective educational research • Not financial advice</span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
