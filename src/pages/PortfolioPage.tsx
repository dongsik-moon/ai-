import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  HelpCircle,
  ExternalLink,
  X,
  RotateCw,
} from 'lucide-react';
import {
  PortfolioItem,
  PortfolioCategory,
  PortfolioStatus,
  PortfolioCritique,
} from '../types/career';
import { safePostJson } from '../utils/apiClient';

interface PortfolioPageProps {
  portfolioItems: PortfolioItem[];
  onSavePortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  portfolioItems,
  onSavePortfolioItem,
  onDeletePortfolioItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCritiqueLoading, setIsCritiqueLoading] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);

  // Form state for creating new portfolio item
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PortfolioCategory>('CAD 모델링');
  const [newCompetenceTag, setNewCompetenceTag] = useState('CATIA V5, BIW 차체설계');
  const [newPurpose, setNewPurpose] = useState('');
  const [newRole, setNewRole] = useState('단독 설계 및 CAE 해석');
  const [newTools, setNewTools] = useState('CATIA V5, ANSYS Mechanical');
  const [newProblem, setNewProblem] = useState('');
  const [newWorkflow, setNewWorkflow] = useState('');
  const [newResults, setNewResults] = useState('');
  const [newDeliverableMeta, setNewDeliverableMeta] = useState('');
  const [newAchievements, setNewAchievements] = useState('');
  const [newLessons, setNewLessons] = useState('');
  const [newUseInResume, setNewUseInResume] = useState(true);

  // Trigger AI Critique for a portfolio item
  const handleRunCritique = async (item: PortfolioItem) => {
    setIsCritiqueLoading(true);
    setCritiqueError(null);

    try {
      const critique = await safePostJson<PortfolioCritique>(
        '/api/ai/critique-portfolio',
        { portfolioItem: item }
      );

      const updated: PortfolioItem = {
        ...item,
        aiCritique: critique,
        status: 'AI 피드백 완료',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      onSavePortfolioItem(updated);
      setSelectedItem(updated);
    } catch (err: any) {
      console.error(err);
      setCritiqueError(err.message || '포트폴리오 첨삭 중 오류가 발생했습니다.');
    } finally {
      setIsCritiqueLoading(false);
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      competenceTag: newCompetenceTag.trim(),
      purpose: newPurpose.trim(),
      role: newRole.trim(),
      tools: newTools.trim(),
      problemDefinition: newProblem.trim(),
      workflow: newWorkflow.trim(),
      results: newResults.trim(),
      deliverableMeta: newDeliverableMeta.trim() || '문서 및 CAD 파일 등록됨',
      achievements: newAchievements.trim(),
      lessonsLearned: newLessons.trim(),
      useInResume: newUseInResume,
      status: '초안',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSavePortfolioItem(newItem);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewPurpose('');
    setNewProblem('');
    setNewWorkflow('');
    setNewResults('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-600" />
            R&D 설계·해석 엔지니어링 포트폴리오
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            현대자동차 차량설계 및 차체해석 실무 면접관에게 증명할 수 있는 실증 프로젝트 결과물을 관리합니다.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 포트폴리오 프로젝트 등록</span>
        </button>
      </div>

      {/* Portfolio Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {portfolioItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === '최종 완성'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'AI 피드백 완료'
                      ? 'bg-purple-100 text-purple-800'
                      : item.status === '개선 필요'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium mb-3">
                🔧 <strong>도구/역량:</strong> {item.tools} | {item.competenceTag}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5 mb-3">
                <p className="line-clamp-2">
                  <strong>목적:</strong> {item.purpose}
                </p>
                <p className="line-clamp-2">
                  <strong>핵심 결과:</strong> {item.results}
                </p>
              </div>

              {item.deliverableMeta && (
                <div className="text-[11px] text-slate-500 mb-2 truncate">
                  📎 {item.deliverableMeta}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-purple-600 font-semibold text-[11px]">
                상세 보기 및 AI 첨삭
              </span>
              <span className="text-slate-400 text-[11px]">
                갱신일: {item.updatedAt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {portfolioItems.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700 mb-1">
            등록된 포트폴리오가 없습니다.
          </p>
          <p className="text-xs text-slate-400 mb-4">
            자작차, 캡스톤 디자인, CATIA 모델링 과제 등 R&D 직무에 어필할 수 있는 프로젝트를 등록해보세요.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            포트폴리오 등록하기
          </button>
        </div>
      )}

      {/* Selected Item Detail & AI Critique Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-slate-400">
                  상태: {selectedItem.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {selectedItem.title}
                </h3>
                <p className="text-xs text-purple-700 font-semibold">
                  {selectedItem.competenceTag} | 사용 도구: {selectedItem.tools}
                </p>
              </div>

              {/* Engineering Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    프로젝트 목적 & 본인의 역할
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>목적:</strong> {selectedItem.purpose}
                  </p>
                  <p className="text-slate-600 leading-relaxed mt-1">
                    <strong>역할:</strong> {selectedItem.role}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    문제 정의 (Problem Definition)
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedItem.problemDefinition}
                  </p>
                </div>
              </div>

              {/* Workflow & Results */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    수행 과정 (Workflow)
                  </span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedItem.workflow}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950">
                  <span className="font-bold text-indigo-900 block mb-1">
                    정량적 분석 결과 및 성과
                  </span>
                  <p className="font-semibold">{selectedItem.results}</p>
                  {selectedItem.achievements && (
                    <p className="mt-1 text-slate-600">
                      성과: {selectedItem.achievements}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Critique Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-white border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-sm text-purple-950">
                      AI R&D 실무진 포트폴리오 첨삭 & 모의 면접 질문
                    </h4>
                  </div>

                  <button
                    onClick={() => handleRunCritique(selectedItem)}
                    disabled={isCritiqueLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isCritiqueLoading ? 'animate-spin' : ''}`} />
                    <span>{isCritiqueLoading ? '첨삭 분석 중...' : 'AI 첨삭 요청'}</span>
                  </button>
                </div>

                {critiqueError && (
                  <p className="text-xs text-rose-600 font-semibold mb-2">
                    {critiqueError}
                  </p>
                )}

                {selectedItem.aiCritique ? (
                  <div className="space-y-3 text-xs">
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800 block mb-1">
                          ✓ 차체 R&D 관점 강점
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {selectedItem.aiCritique.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                        <span className="font-bold text-amber-800 block mb-1">
                          ⚠️ 보완 권장 사항
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {selectedItem.aiCritique.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* STAR Recommendations */}
                    <div className="bg-white/80 p-3 rounded-xl border border-purple-100">
                      <span className="font-bold text-purple-900 block mb-1">
                        💡 STAR 구조 개선 가이드
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {selectedItem.aiCritique.starRecommendations.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Interview Questions */}
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl">
                      <span className="font-bold text-amber-400 block mb-1">
                        🎯 현대차 R&D 1차 기술 면접 예상 질문
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-slate-200">
                        {selectedItem.aiCritique.expectedInterviewQuestions.map((q, i) => (
                          <li key={i} className="leading-snug">{q}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    상단의 [AI 첨삭 요청] 버튼을 누르면 현대차 R&D 실무 면접관 시각에서 프로젝트의 공학적 깊이, STAR 전개, 예상 면접 질문을 분석해드립니다.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm('이 포트폴리오 항목을 삭제하시겠습니까?')) {
                    onDeletePortfolioItem(selectedItem.id);
                    setSelectedItem(null);
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                삭제하기
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Portfolio Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                새 R&D 포트폴리오 프로젝트 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateItem}
              className="p-6 space-y-3.5 overflow-y-auto max-h-[75vh] text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  프로젝트명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 현대차 전기차 B-필러 핫스탬핑 보강재 3D 모델링 및 측면충돌 하중 전달 해석"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="CAD 모델링">CAD 모델링</option>
                    <option value="설계 프로젝트">설계 프로젝트</option>
                    <option value="구조해석">구조해석 (CAE)</option>
                    <option value="시험 및 검증">시험 및 검증</option>
                    <option value="데이터 분석">데이터 분석</option>
                    <option value="자동차 산업 분석">자동차 산업 분석</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    사용 도구
                  </label>
                  <input
                    type="text"
                    value={newTools}
                    onChange={(e) => setNewTools(e.target.value)}
                    placeholder="CATIA V5, ANSYS, HyperMesh 등"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  수행 목적 (해결하려는 차체 엔지니어링 문제)
                </label>
                <textarea
                  rows={2}
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="차체 경량화 및 충돌 강성 동시 만족을 위해..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  수행 과정 및 분석 결과
                </label>
                <textarea
                  rows={3}
                  value={newWorkflow}
                  onChange={(e) => setNewWorkflow(e.target.value)}
                  placeholder="1. 부품 스케치 및 서피스 생성 -> 2. FEA 메시 생성 및 구속조건 부여 -> 3. 응력 집중부 단면 보강..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  핵심 결과 (정량적 수치)
                </label>
                <input
                  type="text"
                  value={newResults}
                  onChange={(e) => setNewResults(e.target.value)}
                  placeholder="비틀림 강성 18% 향상, 부품 중량 4.2kg 절감 등"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
