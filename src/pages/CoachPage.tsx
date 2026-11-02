import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  ArrowRight,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types/career';
import { safePostJson } from '../utils/apiClient';

interface CoachPageProps {
  chatHistory: ChatMessage[];
  onSaveChatHistory: (messages: ChatMessage[]) => void;
  profile: UserProfile;
}

export const CoachPage: React.FC<CoachPageProps> = ({
  chatHistory,
  onSaveChatHistory,
  profile,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    '현대차 차체해석 직무에서 셸(Shell) 요소와 솔리드(Solid) 요소 선정 기준은?',
    '자작차 프레임 경험을 현대차 양산 모노코크 BIW 차체와 연결하는 자소서 첨삭 팁',
    '현대차 R&D 1차 기술면접에서 자주 나오는 차체 정적 비틀림 강성 빈출 질문',
    'CATIA V5 GSD 서피스 모델링을 비전공/학부생 수준에서 포트폴리오로 증명하는 법',
    '초고장력강(AHSS) 핫스탬핑 공법의 특징과 B-필러 부품 적용 이유',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newHistory = [...chatHistory, userMsg];
    onSaveChatHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const data = await safePostJson<{ reply: string }>('/api/ai/chat', {
        messages: newHistory,
        userContext: {
          name: profile.name,
          targetRole: profile.targetRole,
          education: profile.education,
          major: profile.major,
        },
      });

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || '답변을 불러오지 못했습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      onSaveChatHistory([...newHistory, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `⚠️ [AI 연결 오류]: ${err.message || '답변을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.'}`,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      onSaveChatHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('대화 기록을 초기화하시겠습니까?')) {
      const resetMsg: ChatMessage = {
        id: 'init-msg',
        role: 'assistant',
        content:
          '안녕하세요! 현대자동차 R&D 차량설계 및 차체해석 취업 코치 Career Mission AI입니다.\n\n남양연구소 차체설계(BIW, 패키징, CATIA V5) 및 차체해석(구조/충돌/내구 CAE, FEA) 채용을 위한 직무 분석, 포트폴리오 기획, 자기소개서 첨삭, 기술 면접 답변 준비 등 무엇이든 질문하세요!',
        timestamp: '오전 10:00',
      };
      onSaveChatHistory([resetMsg]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-130px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-purple-200">
            <Bot className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              현대자동차 R&D 전담 AI 취업 코치
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-purple-500/30 text-purple-200">
                차량설계·차체해석
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              실무 면접관 관점의 이력서 첨삭, 기술 면접 답변 검증, CAE 및 CATIA 학습 가이드
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1"
          title="대화 초기화"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">대화 비우기</span>
        </button>
      </div>

      {/* Suggested Quick Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          추천 질문:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 whitespace-nowrap transition-colors font-medium text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8f9fc]">
        {chatHistory.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-purple-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-1 ${
                    isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
              <span>현대자동차 R&D 실무 답변 생성 중...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="현대자동차 차량설계·차체해석 취업에 관해 무엇이든 질문하세요..."
            disabled={isLoading}
            className="flex-1 text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>전송</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
