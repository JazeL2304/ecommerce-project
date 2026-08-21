'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  HelpCircle, 
  Bot, 
  User, 
  Loader2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  currentState?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  metrics?: Record<string, any>;
  recommendations?: string[];
  time: string;
}

const PRESET_PROMPTS = [
  {
    label: '🚀 Simulasi Pemangkasan Waktu Pengiriman 3 Hari',
    prompt: 'Bagaimana jika waktu pengiriman dipangkas 3 hari di wilayah luar SP? Apa dampaknya ke CSAT?',
  },
  {
    label: '🎯 Rencana Aksi Menaikkan Repeat Rate ke 6%',
    prompt: 'Bagaimana strategi dan rencana aksi menaikkan repeat customer rate dari 3.04% ke 6%?',
  },
  {
    label: '💳 Dampak Finansial Promosi Cicilan 10x',
    prompt: 'Analisis dampak promosi cicilan 10x kartu kredit terhadap Average Order Value (AOV)',
  },
  {
    label: '🚨 Audit Kategori Berisiko & Rating Rendah',
    prompt: 'Audit kategori produk dengan rating terendah dan rekomendasi perbaikannya',
  },
];

export default function AIAdvisorModal({
  isOpen,
  onClose,
  currentPage = 'overview',
  currentState = 'ALL',
}: AIAdvisorModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Halo! Saya **AI Executive Advisor & Analytics Executor** untuk Olist Brazil.\n\nSaya telah mensinkronisasi data dari **99.441 transaksi** di database. Anda dapat menanyakan simulasi strategi bisnis, audit risiko seller/logistik, segmentasi pelanggan, maupun optimasi finansial.`,
      metrics: {
        'Dataset': '99.4k Orders',
        'State Terpilih': currentState,
        'Repeat Rate': '3.04%',
        'On-Time SLA': '91.89%',
      },
      recommendations: [
        'Pilih salah satu prompt simulasi di bawah atau ketik pertanyaan analitik Anda sendiri.',
      ],
      time: 'Baru saja',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (userPrompt?: string) => {
    const queryText = (userPrompt || input).trim();
    if (!queryText || loading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          context: {
            currentPage,
            state: currentState,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.answer,
          metrics: data.metrics,
          recommendations: data.recommendations,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Maaf, terjadi kendala saat memproses analisis: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141B2B]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-3xl h-[85vh] max-h-[720px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 px-6 bg-linear-to-r from-[#8127CF] to-[#9333EA] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] leading-tight">AI Executive Advisor & Executor</h3>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/20 font-semibold uppercase tracking-wider">
                  Live Intelligence
                </span>
              </div>
              <p className="text-[12px] text-purple-100">
                Synchronized with SQLite 99.4k Orders • Filter: <span className="font-bold">{currentState}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F9FAFB] flex flex-col gap-5">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                msg.sender === 'user' ? 'bg-[#FA9A00]' : 'bg-[#8127CF]'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#885200] text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-[#1E293B] border border-[#E5E7EB] rounded-tl-xs shadow-xs'
                }`}>
                  <div className="whitespace-pre-line">
                    {msg.text.split('**').map((chunk, idx) => 
                      idx % 2 === 1 ? <strong key={idx} className="font-bold text-[#0F172A]">{chunk}</strong> : chunk
                    )}
                  </div>

                  {/* Dynamic Metrics Cards */}
                  {msg.metrics && Object.keys(msg.metrics).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(msg.metrics).map(([key, val]) => (
                        <div key={key} className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                          <div className="text-[10.5px] font-medium text-[#64748B] uppercase tracking-wider">{key}</div>
                          <div className="text-[13.5px] font-bold text-[#8127CF] mt-0.5">{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Recommendations List */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-col gap-1.5">
                      <div className="text-[11.5px] font-bold text-[#334155] flex items-center gap-1.5 uppercase tracking-wide">
                        <Lightbulb className="w-3.5 h-3.5 text-[#FA9A00]" />
                        <span>Rekomendasi Tindakan Strategis:</span>
                      </div>
                      <ul className="flex flex-col gap-1 text-[12.5px] text-[#475569]">
                        {msg.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 px-1 text-[11px] text-[#94A3B8]">
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && (
                    <button 
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-[#64748B] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Salin'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[85%] self-start items-center text-[#64748B] text-xs bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#8127CF]" />
              <span>AI Advisor sedang mengeksekusi analisis & simulasi data...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Chips */}
        <div className="p-3 px-6 bg-white border-t border-[#E5E7EB] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="text-[11.5px] font-semibold text-[#64748B] uppercase shrink-0">Quick Insights:</div>
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(item.prompt)}
              className="text-[12px] bg-[#F1F5F9] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] text-[#334155] px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 px-6 bg-white border-t border-[#E5E7EB] flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tanyakan analisis, simulasi omzet, atau rekomendasi strategi ke AI Advisor..."
            className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#8127CF] focus:bg-white rounded-xl px-4 py-3 text-[13.5px] text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-[#8127CF] hover:bg-[#6D20B0] active:bg-[#581890] text-white px-5 py-3 rounded-xl font-semibold text-[13.5px] flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Kirim</span>
          </button>
        </div>
      </div>
    </div>
  );
}
