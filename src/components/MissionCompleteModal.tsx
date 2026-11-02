import React, { useState } from 'react';
import { X, CheckCircle2, Zap, Upload, FileText, Sparkles } from 'lucide-react';
import { Mission, MissionDeliverable } from '../types/career';

interface MissionCompleteModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (missionId: string, deliverable: MissionDeliverable) => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  mission,
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!isOpen || !mission) return null;

  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() && !content.trim()) {
      alert('결과물 요약 또는 수행 기록을 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(mission.id, {
        summary: summary.trim(),
        content: content.trim(),
        fileName: fileName.trim() || undefined,
        submittedAt: new Date().toISOString(),
        aiReview: '실무 엔지니어링 결과물이 성공적으로 등록되어 역량 검증 상태가 갱신되었습니다.',
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-purple-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                미션 결과물 등록 및 완료
              </h3>
              <p className="text-xs text-slate-400">
                실제 증거 기반 결과물을 등록하고 역량 검증을 완료합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Mission Info Box */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-purple-700">
                {mission.category}
              </span>
              <span className="font-bold text-purple-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-purple-600" />
                보상 +{mission.xp} XP
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              {mission.title}
            </h4>

            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-purple-200/60">
              <p>
                <strong>필수 제출 결과물:</strong> {mission.deliverables.join(', ')}
              </p>
              <p>
                <strong>완료 요건:</strong> {mission.completionCriteria.join('; ')}
              </p>
            </div>
          </div>

          {/* Deliverable Summary Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              결과물 핵심 요약 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예: CATIA V5로 B-필러 보강재 3D 모델링 완료 및 플랜지 폭 15mm 비드 설계 반영"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600"
            />
          </div>

          {/* Detailed Content / Engineering notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              수행 내용 및 공학적 근거 기술 (보고서 텍스트) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="구체적인 설계 의도, 해석 경계조건(하중 및 구속점), 적용 수식, 배운 점 및 개선점을 기술하세요..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 leading-relaxed font-sans"
            />
          </div>

          {/* File Meta / Attachment info */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              첨부 파일명 또는 저장 위치 (선택 사항)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="예: BPillar_Reinforcement_v2.CATPart 또는 Torsional_CAE_Report.pdf"
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * 로컬 환경에 저장된 CAD 모델 파일명이나 포트폴리오 PDF 문서명을 기록합니다.
            </p>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSubmitting ? '등록 중...' : '완료하고 XP 획득하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
