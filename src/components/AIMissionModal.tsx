import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Zap,
  Check,
  RefreshCw,
  Plus,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  UserProfile,
  SkillDomain,
  Mission,
  PortfolioItem,
  DiagnosisResult,
} from '../types/career';

interface AIMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  skills: SkillDomain[];
  missions: Mission[];
  portfolioItems: PortfolioItem[];
  diagnosis: DiagnosisResult;
  onSaveDiagnosis: (diag: DiagnosisResult) => void;
  onAddMissions: (newMissions: Mission[]) => void;
}

export const AIMissionModal: React.FC<AIMissionModalProps> = ({
  isOpen,
  onClose,
  profile,
  skills,
  missions,
  portfolioItems,
  diagnosis,
  onSaveDiagnosis,
  onAddMissions,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnose' | 'generator'>('diagnose');

  // Generator form settings
  const [purpose, setPurpose] = useState('부족 역량 보완');
  const [difficulty, setDifficulty] = useState<'입문' | '기초' | '중급' | '심화'>('기초');
  const [duration, setDuration] = useState('2~3시간');
  const [priority, setPriority] = useState<'긴급' | '높음' | '보통'>('높음');
  const [count, setCount] = useState<number>(3);
  const [deliverableType, setDeliverableType] = useState('기술 보고서');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generated missions staging
  const [generatedMissions, setGeneratedMissions] = useState<Mission[]>([]);
  const [selectedMissionIds, setSelectedMissionIds] = useState<string[]>([]);
  const [addedMissionIds, setAddedMissionIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Run AI Diagnosis via server endpoint
  const handleRunDiagnosis = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('사용자 프로필, CAD/CAE 보유역량 및 포트폴리오 분석 중...');

    try {
      const completed = missions.filter((m) => m.status === 'completed');

      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          skills,
          completedMissions: completed,
          portfolioItems,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `서버 오류 (${res.status})`);
      }

      setLoadingStep('현대자동차 R&D 차량설계·차체해석 기준 역량 격차 분석 중...');
      const data = await res.json();

      // Format diagnosis result
      const newDiagnosis: DiagnosisResult = {
        summary: data.summary || data.diagnosis?.summary || '진단 요약이 생성되었습니다.',
        confidence: data.confidence || data.diagnosis?.confidence || 'medium',
        strengths: data.strengths || data.diagnosis?.strengths || [],
        gaps: data.gaps || data.diagnosis?.gaps || [],
        documentReview: data.documentReview || data.diagnosis?.documentReview || [],
        topPriorities: data.topPriorities || data.diagnosis?.topPriorities || [],
        diagnosedAt: new Date().toISOString().split('T')[0],
      };

      onSaveDiagnosis(newDiagnosis);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'AI 진단 요청 중 오류가 발생했습니다. Settings > Secrets에 API 키가 설정되어 있는지 확인하세요.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Run AI Mission Generator via server endpoint
  const handleGenerateMissions = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('현대차 차량설계/CAE 증거 기반 실무 과제 설계 중...');

    try {
      const existingTitles = missions.map((m) => m.title);

      const res = await fetch('/api/ai/generate-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          existingMissionTitles: existingTitles,
          settings: {
            purpose,
            difficulty,
            duration,
            priority,
            count,
            deliverableType,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `서버 오류 (${res.status})`);
      }

      const data = await res.json();
      const rawList = data.missions || [];

      if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('AI가 생성한 미션 데이터가 올바르지 않습니다.');
      }

      // Format raw missions into application Mission objects
      const newMissions: Mission[] = rawList.map((m: any, idx: number) => {
        let xpReward = 150;
        if (m.difficulty === '입문') xpReward = 80;
        else if (m.difficulty === '기초') xpReward = 120;
        else if (m.difficulty === '중급') xpReward = 200;
        else if (m.difficulty === '심화') xpReward = 300;

        return {
          id: `gen-mission-${Date.now()}-${idx}`,
          title: m.title || `차체 엔지니어링 실무 미션 #${idx + 1}`,
          category: m.category || 'CAD 및 3D 모델링',
          difficulty: (m.difficulty as any) || difficulty,
          priority: (m.priority as any) || priority,
          estimatedMinutes: Number(m.estimatedMinutes) || 120,
          xp: m.xp || xpReward,
          reason: m.reason || '목표 직무 역량 강화를 위해 추천되었습니다.',
          targetGap: m.targetGap || '차체설계 및 해석 실무 결과물 확보',
          steps: Array.isArray(m.steps) ? m.steps : [m.steps || '과제 수행'],
          deliverables: Array.isArray(m.deliverables) ? m.deliverables : [m.deliverables || '결과물 제출'],
          completionCriteria: Array.isArray(m.completionCriteria) ? m.completionCriteria : ['수행 요건 만족'],
          evaluationCriteria: Array.isArray(m.evaluationCriteria) ? m.evaluationCriteria : ['실무 완성도 검증'],
          prerequisites: Array.isArray(m.prerequisites) ? m.prerequisites : [],
          nextMissionSuggestion: m.nextMissionSuggestion || '',
          status: 'planned',
          isTodayFocus: false,
        };
      });

      setGeneratedMissions(newMissions);
      setSelectedMissionIds(newMissions.map((m) => m.id));
      setAddedMissionIds([]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || '미션 생성 중 오류가 발생했습니다. Settings > Secrets 설정을 확인하고 다시 시도하세요.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Toggle mission selection
  const toggleSelectMission = (id: string) => {
    setSelectedMissionIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Add selected missions to user's active list
  const handleAddSelectedMissions = () => {
    const toAdd = generatedMissions.filter(
      (m) => selectedMissionIds.includes(m.id) && !addedMissionIds.includes(m.id)
    );
    if (toAdd.length === 0) return;

    onAddMissions(toAdd);
    setAddedMissionIds((prev) => [...prev, ...toAdd.map((m) => m.id)]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-purple-200 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Career Mission AI Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  현대자동차 R&D 특화
                </span>
              </div>
              <p className="text-xs text-slate-300">
                차량설계(BIW) & 차체해석(CAE) 취업 역량 정밀 진단 및 개인화 미션 생성
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('diagnose')}
            className={`py-3.5 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'diagnose'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📊 탭 A. 취업 역량 종합 진단</span>
            <span className="text-xs font-normal text-slate-400">(내 경쟁력 분석)</span>
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`py-3.5 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🎯 탭 B. 맞춤형 미션 생성</span>
            <span className="text-xs font-normal text-slate-400">(실무 결과물 생성)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fc]">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">AI 요청 실패</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs font-semibold underline text-rose-700 hover:text-rose-900"
              >
                닫기
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-800">
                  {loadingStep || 'AI가 차량설계 및 차체해석 역량을 분석 중입니다...'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  현대자동차 R&D 본부의 BIW 구조 및 FEA 엔지니어 기준을 적용하고 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB A: 취업 역량 종합 진단 */}
          {!isLoading && activeTab === 'diagnose' && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    최근 진단 일자: {diagnosis.diagnosedAt || '2026-11-01'}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                      신뢰도: {diagnosis.confidence === 'high' ? '높음' : '보통'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    프로필, 이력서, 자격증, CATIA/CAE 역량, 등록 포트폴리오를 기반으로 진단합니다.
                  </p>
                </div>
                <button
                  onClick={handleRunDiagnosis}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>내 취업 경쟁력 분석하기</span>
                </button>
              </div>

              {/* ① 종합 진단 요약 */}
              <div className="p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-2xl text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    ① 종합 진단 요약
                  </span>
                  <span className="text-xs text-slate-300">
                    목표: 현대자동차 R&D 차량설계·차체해석
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100 font-medium whitespace-pre-line">
                  {diagnosis.summary}
                </p>

                {/* Strengths & Urgent */}
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      확인된 핵심 강점 (Top 3)
                    </h5>
                    <ul className="space-y-2 text-xs">
                      {diagnosis.strengths.slice(0, 3).map((st, i) => (
                        <li key={i} className="text-slate-200">
                          <strong className="text-white block font-semibold">
                            {st.title}
                          </strong>
                          <span className="text-slate-300 text-[11px]">
                            {st.evidence}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      최우선 개선 과제
                    </h5>
                    <ul className="space-y-2 text-xs">
                      {diagnosis.topPriorities.slice(0, 3).map((tp, i) => (
                        <li key={i} className="text-slate-200">
                          <strong className="text-white block font-semibold">
                            {i + 1}. {tp.title}
                          </strong>
                          <span className="text-slate-300 text-[11px]">
                            {tp.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ② 직무 역량 격차 분석 (Table) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      ② 직무 역량 격차 분석 (Competency Gap Analysis)
                    </h4>
                    <p className="text-xs text-slate-500">
                      현대차 차량설계 및 차체해석 직무 기준 현재 수준과 목표 수준의 격차
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">직무 역량</th>
                        <th className="py-2.5 px-3">목표 수준</th>
                        <th className="py-2.5 px-3">현재 수준</th>
                        <th className="py-2.5 px-4">평가 근거</th>
                        <th className="py-2.5 px-4">개선 방향</th>
                        <th className="py-2.5 px-3">우선순위</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {diagnosis.gaps.map((gap, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {gap.skill}
                          </td>
                          <td className="py-3 px-3 text-purple-700 font-medium">
                            {gap.targetLevel}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {gap.currentLevel}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {gap.evidence}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {gap.improvement}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                gap.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : gap.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {gap.priority === 'urgent'
                                ? '긴급'
                                : gap.priority === 'high'
                                ? '높음'
                                : '보통'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ③ 지원 서류 진단 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  ③ 지원 서류 및 포트폴리오 진단
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {diagnosis.documentReview.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {doc.section}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              doc.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.status === 'needs_work'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {doc.status === 'confirmed'
                              ? '검토 완료'
                              : doc.status === 'needs_work'
                              ? '보완 필요'
                              : '미등록'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mb-2">
                          {doc.finding}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-purple-700 font-medium">
                        💡 {doc.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch to Generator Callout */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-purple-900 text-xs">
                    진단된 역량 격차를 해소하기 위한 실무 미션을 생성하시겠습니까?
                  </h5>
                  <p className="text-xs text-purple-700">
                    부족한 CATIA GSD 모델링 및 차체 CAE 하중조건을 보완하는 결과물 제작 미션을 바로 생성합니다.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('generator')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  맞춤 미션 생성 탭으로 이동 →
                </button>
              </div>
            </div>
          )}

          {/* TAB B: 맞춤형 미션 생성 */}
          {!isLoading && activeTab === 'generator' && (
            <div className="space-y-6">
              {/* Generator Settings Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      맞춤형 취업 미션 설정
                    </h4>
                    <p className="text-xs text-slate-500">
                      현대자동차 R&D 본부 차량설계 및 차체해석 직무 지원용 증거 기반 결과물 미션을 생성합니다.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateMissions}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>맞춤 미션 생성하기</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Purpose */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      미션 목적
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 font-medium"
                    >
                      <option value="부족 역량 보완">부족 역량 보완</option>
                      <option value="포트폴리오 제작">포트폴리오 제작</option>
                      <option value="서류 개선">서류 개선</option>
                      <option value="기술 학습">기술 학습</option>
                      <option value="면접 준비">면접 준비</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      난이도
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 font-medium"
                    >
                      <option value="입문">입문 (기본 개념)</option>
                      <option value="기초">기초 (실습/분석)</option>
                      <option value="중급">중급 (심화 모델링/해석)</option>
                      <option value="심화">심화 (종합 프로젝트)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      예상 소요 시간
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 font-medium"
                    >
                      <option value="30분">30분</option>
                      <option value="1시간">1시간</option>
                      <option value="2~3시간">2~3시간</option>
                      <option value="4시간 이상">4시간 이상</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      우선순위
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 font-medium"
                    >
                      <option value="긴급">긴급 (시급함)</option>
                      <option value="높음">높음</option>
                      <option value="보통">보통</option>
                    </select>
                  </div>

                  {/* Count */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      생성 개수
                    </label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 font-medium"
                    >
                      <option value={1}>1개</option>
                      <option value={3}>3개</option>
                      <option value={5}>5개</option>
                    </select>
                  </div>

                  {/* Deliverable Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      결과물 유형
                    </label>
                    <select
                      value={deliverableType}
                      onChange={(e) => setDeliverableType(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600 font-medium"
                    >
                      <option value="기술 보고서">기술 보고서</option>
                      <option value="CAD 모델">CAD 모델(캡처)</option>
                      <option value="해석 보고서">FEA 해석 보고서</option>
                      <option value="데이터 분석">데이터 분석</option>
                      <option value="학습 기록">학습 기록</option>
                      <option value="면접 답변">면접 구술 답변</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Generated Missions Preview List */}
              {generatedMissions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        생성된 AI 추천 미션 ({generatedMissions.length}개)
                      </h4>
                      <p className="text-xs text-slate-500">
                        원하는 미션을 선택하여 나의 미션 목록에 추가하세요. (등록 전까지 임시 상태)
                      </p>
                    </div>

                    <button
                      onClick={handleAddSelectedMissions}
                      disabled={selectedMissionIds.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        선택한 {selectedMissionIds.length}개 미션 등록하기
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {generatedMissions.map((m) => {
                      const isSelected = selectedMissionIds.includes(m.id);
                      const isAdded = addedMissionIds.includes(m.id);

                      return (
                        <div
                          key={m.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isAdded
                              ? 'bg-emerald-50/40 border-emerald-300 opacity-90'
                              : isSelected
                              ? 'bg-white border-purple-400 shadow-md ring-1 ring-purple-300'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                                  {m.category}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {m.difficulty}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                                  <Zap className="w-3 h-3 fill-purple-600" />
                                  +{m.xp} XP
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {m.estimatedMinutes}분
                                </span>
                              </div>

                              <h4 className="font-bold text-slate-900 text-base mb-1">
                                {m.title}
                              </h4>
                              <p className="text-xs text-slate-600 mb-3">
                                💡 <strong>추천 이유:</strong> {m.reason}
                              </p>

                              {/* Steps */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3">
                                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                                  수행 단계 (Steps)
                                </span>
                                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                                  {m.steps.map((step, idx) => (
                                    <li key={idx} className="leading-snug">
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              {/* Deliverables & Criteria */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-900">
                                  <span className="font-bold block text-[10px] uppercase text-indigo-700 mb-0.5">
                                    제출 결과물
                                  </span>
                                  {m.deliverables.join(', ')}
                                </div>
                                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                                  <span className="font-bold block text-[10px] uppercase text-emerald-700 mb-0.5">
                                    완료 조건
                                  </span>
                                  {m.completionCriteria.join('; ')}
                                </div>
                              </div>
                            </div>

                            {/* Select / Added Checkbox */}
                            <div className="shrink-0 flex flex-col items-end gap-2">
                              {isAdded ? (
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                  등록 완료
                                </span>
                              ) : (
                                <button
                                  onClick={() => toggleSelectMission(m.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                    isSelected
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {isSelected ? '선택됨 ✓' : '선택'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Empty state prompt for generator */
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    아직 생성된 미션이 없습니다
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    상단의 설정 조건(미션 목적, 난이도, 소요 시간)을 선택하고 [맞춤 미션 생성하기] 버튼을 누르면 AI가 현대차 R&D 차량설계·해석 맞춤형 미션을 설계합니다.
                  </p>
                  <button
                    onClick={handleGenerateMissions}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>지금 맞춤 미션 생성하기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>AI는 실제 등록된 사용자의 역량 데이터와 현대차 R&D 직무 요건만을 바탕으로 분석합니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
