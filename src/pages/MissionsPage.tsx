import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Zap,
  Filter,
  Plus,
  FileCheck,
  ChevronRight,
  Sparkles,
  BookOpen,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Mission, MissionDeliverable, MissionStatus } from '../types/career';

interface MissionsPageProps {
  missions: Mission[];
  onOpenCompleteModal: (mission: Mission) => void;
  onOpenAIMissionModal: () => void;
  onUpdateMissionStatus: (missionId: string, status: MissionStatus) => void;
}

export const MissionsPage: React.FC<MissionsPageProps> = ({
  missions,
  onOpenCompleteModal,
  onOpenAIMissionModal,
  onUpdateMissionStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const categories = [
    '전체',
    'CAD 및 3D 모델링',
    '차량설계',
    '차체 구조 및 재료',
    '구조해석 및 CAE',
    '설계 검증 및 시험',
    '자동차 산업 및 기술 분석',
    '직무 역량 및 자격증',
    '자기소개서 및 면접',
    '포트폴리오',
  ];

  const statusTabs = [
    { id: 'all', label: '전체', count: missions.length },
    {
      id: 'planned',
      label: '예정',
      count: missions.filter((m) => m.status === 'planned').length,
    },
    {
      id: 'in_progress',
      label: '진행 중',
      count: missions.filter((m) => m.status === 'in_progress').length,
    },
    {
      id: 'needs_review',
      label: '검토 필요',
      count: missions.filter((m) => m.status === 'needs_review').length,
    },
    {
      id: 'completed',
      label: '완료',
      count: missions.filter((m) => m.status === 'completed').length,
    },
    {
      id: 'on_hold',
      label: '보류',
      count: missions.filter((m) => m.status === 'on_hold').length,
    },
  ];

  const filteredMissions = missions.filter((m) => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchCategory =
      categoryFilter === 'all' || m.category === categoryFilter;
    return matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            나의 미션 관리
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            현대자동차 R&D 차량설계·차체해석 직무 역량을 증명하기 위한 단계별 수행 미션입니다.
          </p>
        </div>

        <button
          onClick={onOpenAIMissionModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>✨ 새 AI 미션 추가</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-xl px-2 shadow-sm">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id
                  ? 'bg-purple-100 text-purple-800 font-extrabold'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          카테고리:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === '전체' ? 'all' : cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              (categoryFilter === 'all' && cat === '전체') || categoryFilter === cat
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMissions.map((mission) => {
          const isCompleted = mission.status === 'completed';

          return (
            <div
              key={mission.id}
              onClick={() => setSelectedMission(mission)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCompleted
                  ? 'bg-slate-50/70 border-emerald-200 hover:border-emerald-300'
                  : 'bg-white border-slate-200/90 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    {mission.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-xs font-bold text-purple-700">
                      <Zap className="w-3 h-3 fill-purple-600" />
                      +{mission.xp} XP
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : mission.status === 'in_progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted
                        ? '완료됨'
                        : mission.status === 'in_progress'
                        ? '진행 중'
                        : '예정'}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2">
                  {mission.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {mission.reason}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
                  <div className="truncate">
                    <strong>결과물:</strong> {mission.deliverables[0]}
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>난이도: {mission.difficulty}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mission.estimatedMinutes}분 소요
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-purple-600 font-semibold flex items-center gap-1 text-[11px]">
                  상세 보기
                  <ChevronRight className="w-3 h-3" />
                </span>

                {!isCompleted ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCompleteModal(mission);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                  >
                    결과물 등록
                  </button>
                ) : (
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    결과물 제출 완료
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMissions.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700 mb-1">
            해당 조건의 미션이 없습니다.
          </p>
          <p className="text-xs text-slate-400 mb-4">
            필터를 변경하거나 AI를 통해 새로운 실무 미션을 생성해보세요.
          </p>
          <button
            onClick={onOpenAIMissionModal}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            새 맞춤 미션 생성하기
          </button>
        </div>
      )}

      {/* Mission Detail Modal / Slide-over */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  {selectedMission.category}
                </span>
                <span className="text-xs text-slate-400">
                  난이도: {selectedMission.difficulty}
                </span>
              </div>
              <button
                onClick={() => setSelectedMission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedMission.title}
                  </h3>
                  <span className="text-sm font-extrabold text-purple-700 flex items-center gap-1 shrink-0">
                    <Zap className="w-4 h-4 fill-purple-600" />
                    +{selectedMission.xp} XP
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  💡 <strong>추천 배경:</strong> {selectedMission.reason}
                </p>
                <p className="text-xs text-indigo-700 font-semibold mt-1">
                  🎯 <strong>달성하려는 역량:</strong> {selectedMission.targetGap}
                </p>
              </div>

              {/* Steps */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  구체적인 수행 단계 (Step-by-Step)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                  {selectedMission.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Deliverables & Completion Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <span className="font-bold text-indigo-900 block mb-1">
                    제출할 결과물 형태
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedMission.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">
                    완료 조건 및 평가 기준
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedMission.completionCriteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* If completed, show submission */}
              {selectedMission.status === 'completed' && selectedMission.userDeliverable && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      등록된 수행 결과물
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      제출일: {selectedMission.userDeliverable.submittedAt?.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mb-1">
                    {selectedMission.userDeliverable.summary}
                  </p>
                  <p className="text-xs text-slate-700 whitespace-pre-line bg-white/70 p-2.5 rounded-lg border border-emerald-100 mb-2">
                    {selectedMission.userDeliverable.content}
                  </p>
                  {selectedMission.userDeliverable.fileName && (
                    <p className="text-[11px] text-slate-600">
                      📎 <strong>첨부 파일:</strong> {selectedMission.userDeliverable.fileName}
                    </p>
                  )}
                  {selectedMission.userDeliverable.aiReview && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-purple-900 font-medium">
                      🤖 <strong>AI 피드백:</strong> {selectedMission.userDeliverable.aiReview}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">상태 변경:</span>
                <select
                  value={selectedMission.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as MissionStatus;
                    onUpdateMissionStatus(selectedMission.id, newStatus);
                    setSelectedMission({ ...selectedMission, status: newStatus });
                  }}
                  className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  <option value="planned">예정</option>
                  <option value="in_progress">진행 중</option>
                  <option value="needs_review">검토 필요</option>
                  <option value="completed">완료</option>
                  <option value="on_hold">보류</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMission(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  닫기
                </button>
                {selectedMission.status !== 'completed' && (
                  <button
                    onClick={() => {
                      const m = selectedMission;
                      setSelectedMission(null);
                      onOpenCompleteModal(m);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>결과물 등록하고 완료</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
