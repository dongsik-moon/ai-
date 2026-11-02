import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, UserStats } from '../types/career';

interface SettingsPageProps {
  profile: UserProfile;
  stats: UserStats;
  onSaveProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
  onImportData: (jsonData: string) => boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  stats,
  onSaveProfile,
  onResetAllData,
  onImportData,
}) => {
  const [targetDate, setTargetDate] = useState(profile.targetHireDate || '');
  const [dailyHours, setDailyHours] = useState(profile.dailyTargetHours || 3);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const handleSaveSettings = () => {
    onSaveProfile({
      ...profile,
      targetHireDate: targetDate,
      dailyTargetHours: Number(dailyHours),
    });
    setStatusToast('환경 설정이 성공적으로 저장되었습니다.');
    setTimeout(() => setStatusToast(null), 2500);
  };

  const handleExportBackup = () => {
    const backup = {
      profile,
      stats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerMissionAI_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = onImportData(content);
        if (ok) {
          setStatusToast('데이터가 성공적으로 복원되었습니다.');
        } else {
          alert('데이터 형식이 올바르지 않습니다.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          설정 및 데이터 관리
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          취업 목표 일정, 학습 목표 시간 및 로컬 데이터 백업/초기화를 관리합니다.
        </p>
      </div>

      {statusToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Goal Schedule Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          목표 일정 및 일일 학습량 설정
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              목표 채용일 (D-Day 카운트다운 기준)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * 상단 헤더 및 대시보드에 D-Day가 실시간 표시됩니다.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              하루 목표 투자 시간 (시간)
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * 대시보드 일일 투자 시간 지표의 기준치가 됩니다.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
          >
            설정 저장하기
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          데이터 백업 및 복원 (JSON)
        </h3>

        <p className="text-xs text-slate-600">
          모든 미션 수행 기록, 획득 XP, 작성된 포트폴리오 및 프로필을 안전하게 내보내거나 불러올 수 있습니다.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>데이터 백업 내보내기 (.json)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>백업 파일 복원 (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset All Data */}
      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-800">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-sm">데이터 초기화 (Danger Zone)</h3>
        </div>

        <p className="text-xs text-rose-700">
          모든 미션 완료 기록, XP, 레벨, 스킬 트리 평가 및 커스텀 포트폴리오를 초기 상태로 리셋합니다. 이 작업은 되돌릴 수 없습니다.
        </p>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>모든 데이터 초기화</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="font-bold text-base text-slate-900">
                정말로 데이터를 초기화하시겠습니까?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                완료한 미션 결과물, 획득한 {stats.xp} XP 및 레벨 기록이 기본 예시 데이터로 재설정됩니다.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                  setStatusToast('데이터가 초기화되었습니다.');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                네, 초기화합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
