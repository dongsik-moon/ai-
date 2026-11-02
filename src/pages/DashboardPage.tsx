import React from 'react';
import {
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Target,
} from 'lucide-react';
import { Mission, UserProfile, UserStats } from '../types/career';

interface DashboardPageProps {
  profile: UserProfile;
  stats: UserStats;
  missions: Mission[];
  onOpenCompleteModal: (mission: Mission) => void;
  onOpenAIMissionModal: () => void;
  onNavigateToMissions: () => void;
  onAddMissionToFocus: (missionId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  stats,
  missions,
  onOpenCompleteModal,
  onOpenAIMissionModal,
  onNavigateToMissions,
  onAddMissionToFocus,
}) => {
  // Today's focus missions (filter by isTodayFocus or first 3 active)
  const todayMissions = missions.filter((m) => m.isTodayFocus || m.status === 'in_progress').slice(0, 3);
  const fallbackMissions = todayMissions.length > 0 ? todayMissions : missions.slice(0, 3);

  // AI Recommended missions (isRecommended or planned)
  const recommendedMissions = missions
    .filter((m) => m.isRecommended && m.status === 'planned' && !m.isTodayFocus)
    .slice(0, 3);

  const completionRate =
    stats.totalMissions > 0
      ? Math.round((stats.completedMissions / stats.totalMissions) * 100)
      : 0;

  const targetMinutes = (profile.dailyTargetHours || 3) * 60;
  const recordedMinutes = stats.dailyRecordedMinutes || 135;
  const timeProgressPercent = Math.min(
    100,
    Math.round((recordedMinutes / targetMinutes) * 100)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* A. Target Job Goal Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-7 md:p-8 text-white shadow-xl shadow-slate-200">
        {/* Background glow lines */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-60 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold tracking-wide">
              <span>LEVEL {stats.level}</span>
              <span className="w-1 h-1 rounded-full bg-purple-400" />
              <span>HYUNDAI MOTOR R&D</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {profile.targetRole || '현대자동차 R&D 차량설계 및 차체해석 엔지니어'}
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              오늘의 미션을 수행하고, 설계 역량을 증명할 수 있는 결과물을 완성하세요.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                🏢 남양연구소 R&D 본부
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                🚗 BIW 차체설계 & CAE 구조해석
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                📐 CATIA V5 & FEA 특화
              </span>
            </div>
          </div>

          {/* Right Metrics in Banner */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[260px] space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">
                  종합 취업 준비 진행률
                </span>
                <span className="text-white font-extrabold text-sm">
                  {stats.jobReadinessPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-400 to-indigo-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.jobReadinessPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * 단순 미션 수가 아닌 보유 역량 검증도 기반
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">누적 획득 XP</span>
                <span className="font-bold text-white text-sm">
                  {stats.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">다음 레벨까지</span>
                <span className="font-bold text-purple-300 text-sm">
                  {Math.max(0, stats.nextLevelXp - stats.xp)} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* B. Core Growth Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">성장 레벨</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              LV.{stats.level}
            </span>
            <span className="text-xs text-purple-700 font-semibold">
              R&D 엔지니어
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            누적 <strong className="text-slate-800">{stats.xp.toLocaleString()} XP</strong>
          </p>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">연속 학습일</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {stats.streakDays}
            </span>
            <span className="text-xs text-orange-600 font-semibold">일 연속</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            한국 시간 기준 미션 완수 기록
          </p>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">미션 달성률</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({stats.completedMissions}/{stats.totalMissions} 완료)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Card 4: Daily Study Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">일일 투자 시간</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {Math.floor(recordedMinutes / 60)}h {recordedMinutes % 60}m
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / 목표 {profile.dailyTargetHours || 3}h
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${timeProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Today's Focus Missions + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. 오늘의 집중 미션 (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                오늘의 집중 미션 (Today's Focus)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {fallbackMissions.filter((m) => m.status === 'completed').length}/
                {fallbackMissions.length} 완료
              </span>
            </div>

            <button
              onClick={onNavigateToMissions}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              전체 미션 보기 ({missions.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {fallbackMissions.map((mission) => {
              const isCompleted = mission.status === 'completed';

              return (
                <div
                  key={mission.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-50/80 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800">
                        {mission.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {mission.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-purple-700">
                        <Zap className="w-3.5 h-3.5 fill-purple-600" />
                        +{mission.xp} XP
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {mission.estimatedMinutes}분
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        완료됨 (+{mission.xp} XP)
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        진행 예정
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    {mission.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {mission.reason}
                  </p>

                  {/* Steps summary */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1 mb-3">
                    <span className="font-bold text-slate-700 block text-[11px]">
                      핵심 수행 단계:
                    </span>
                    <p className="line-clamp-2">
                      {mission.steps.join(' → ')}
                    </p>
                  </div>

                  {/* Completion criteria & Deliverables */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-500 text-[11px] max-w-sm truncate">
                      <strong>결과물:</strong> {mission.deliverables.join(', ')}
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={() => onOpenCompleteModal(mission)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors active:scale-95"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>결과물 등록 및 완료</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        ✓ 결과물 제출 완료 ({mission.userDeliverable?.fileName || '보고서 등록됨'})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* D. AI 추천 후속 미션 (Right Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                AI 추천 후속 미션
              </h3>
            </div>
            <button
              onClick={onOpenAIMissionModal}
              className="text-xs text-purple-600 hover:underline font-semibold"
            >
              새로 생성
            </button>
          </div>

          <div className="space-y-3">
            {recommendedMissions.length > 0 ? (
              recommendedMissions.map((rm) => (
                <div
                  key={rm.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {rm.category}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-purple-700 text-[11px]">
                      <Zap className="w-3 h-3 fill-purple-600" />
                      +{rm.xp} XP
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm leading-snug">
                    {rm.title}
                  </h5>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    💡 {rm.reason}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rm.estimatedMinutes}분 소요
                    </span>
                    <button
                      onClick={() => onAddMissionToFocus(rm.id)}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1"
                    >
                      <span>도전하기</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-3">
                  현재 대기 중인 AI 추천 미션이 없습니다.
                </p>
                <button
                  onClick={onOpenAIMissionModal}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  AI 맞춤 미션 추가하기
                </button>
              </div>
            )}

            {/* AI Diagnosis CTA Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="font-bold text-sm">
                  취업 역량 정밀 진단이 필요하신가요?
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                현재 등록된 이력서, 학점, CATIA 및 FEA 해석 경험을 바탕으로 현대자동차 합격 역량 격차를 분석합니다.
              </p>
              <button
                onClick={onOpenAIMissionModal}
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 hover:bg-purple-50 font-bold text-xs shadow-md transition-colors"
              >
                내 취업 경쟁력 분석하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
