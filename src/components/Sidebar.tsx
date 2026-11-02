import React from 'react';
import {
  LayoutDashboard,
  Target,
  GitBranch,
  Briefcase,
  Bot,
  UserCheck,
  Settings,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, UserStats } from '../types/career';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAIMissionModal: () => void;
  profile: UserProfile;
  stats: UserStats;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAIMissionModal,
  profile,
  stats,
}) => {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'missions', label: '나의 미션', icon: Target },
    { id: 'skills', label: '스킬 트리', icon: GitBranch },
    { id: 'portfolio', label: '포트폴리오', icon: Briefcase },
    { id: 'coach', label: 'AI 취업 코치', icon: Bot },
    { id: 'competencies', label: '취업 목표 & 역량', icon: UserCheck },
    { id: 'settings', label: '설정 & 프로필', icon: Settings },
  ];

  // Calculate percentage within current level
  const baseLevelXp = stats.level === 1 ? 0 : stats.level === 2 ? 300 : stats.level === 3 ? 800 : stats.level === 4 ? 1500 : 2500;
  const nextTargetXp = stats.nextLevelXp;
  const currentTierXp = Math.max(0, stats.xp - baseLevelXp);
  const tierDiff = Math.max(100, nextTargetXp - baseLevelXp);
  const xpPercent = Math.min(100, Math.round((currentTierXp / tierDiff) * 100));

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Top Brand Area */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <span className="font-bold text-lg tracking-wider">CM</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">
                Career Mission
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded">
                AI
              </span>
            </div>
            <p className="text-[11px] text-purple-600 font-medium">
              R&D 취업 성장 게임
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Summary Card */}
      <div className="p-4 mx-3 my-3 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white shadow-lg shadow-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-bold text-sm text-purple-200">
              {profile.name ? profile.name.slice(0, 1) : '김'}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                {profile.name || '김현우'}
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/40 border border-purple-400/30 rounded text-purple-200 font-normal">
                  R&D 준비
                </span>
              </h4>
              <p className="text-[11px] text-slate-300 truncate max-w-[130px]" title={profile.targetRole}>
                {profile.targetRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{stats.streakDays}일</span>
          </div>
        </div>

        {/* Level and XP */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-purple-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              LV.{stats.level} 엔지니어
            </span>
            <span className="text-slate-400 text-[11px]">
              {stats.xp} / {stats.nextLevelXp} XP
            </span>
          </div>
          <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right mt-1">
            다음 레벨까지 <span className="text-purple-300 font-medium">{Math.max(0, stats.nextLevelXp - stats.xp)} XP</span>
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-50 text-purple-800 font-bold shadow-sm shadow-purple-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-purple-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-purple-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Target Corporation Tag */}
      <div className="px-4 py-2 mx-3 mb-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[11px] font-medium text-slate-600 truncate">
          목표: <strong className="text-slate-800">현대자동차 남양연구소</strong>
        </span>
      </div>

      {/* Bottom Sticky Action Button: ✨ AI 미션 추가 / 생성 */}
      <div className="p-3 border-t border-slate-200/80 bg-white">
        <button
          onClick={onOpenAIMissionModal}
          className="w-full relative group overflow-hidden py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all transform active:scale-[0.98] bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span className="tracking-tight">✨ AI 미션 추가 / 생성</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
