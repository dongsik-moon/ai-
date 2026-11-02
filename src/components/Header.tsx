import React from 'react';
import { Calendar, Flame, Award, Zap, Sparkles } from 'lucide-react';
import { UserProfile, UserStats } from '../types/career';

interface HeaderProps {
  title: string;
  subtitle?: string;
  profile: UserProfile;
  stats: UserStats;
  onOpenAIMissionModal: () => void;
  onNavigateToCompetencies?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  profile,
  stats,
  onOpenAIMissionModal,
  onNavigateToCompetencies,
}) => {
  // Calculate D-Day
  let dDayText = '목표일 미설정';
  let isDDaySet = false;

  if (profile.targetHireDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(profile.targetHireDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      dDayText = `D-${diffDays}`;
      isDDaySet = true;
    } else {
      dDayText = `D+${Math.abs(diffDays)}`;
      isDDaySet = true;
    }
  }

  return (
    <header className="h-18 px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>

      {/* Right Status Chips */}
      <div className="flex items-center gap-3">
        {/* D-Day Chip */}
        <div
          onClick={!isDDaySet ? onNavigateToCompetencies : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
            isDDaySet
              ? 'bg-purple-50/80 border-purple-200 text-purple-900'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
          title={isDDaySet ? `목표 취업일: ${profile.targetHireDate}` : '목표일을 설정하세요'}
        >
          <Calendar className="w-3.5 h-3.5 text-purple-600" />
          <span>{isDDaySet ? `채용 목표일 ${dDayText}` : '목표일 설정하기'}</span>
        </div>

        {/* Streak Chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          <span>{stats.streakDays}일 연속</span>
        </div>

        {/* Level Chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>LV.{stats.level}</span>
        </div>

        {/* XP Chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
          <span>{stats.xp.toLocaleString()} XP</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenAIMissionModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-purple-900 shadow-sm transition-colors active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI 역량 진단</span>
        </button>
      </div>
    </header>
  );
};
