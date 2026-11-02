import React, { useState } from 'react';
import {
  GitBranch,
  Box,
  Car,
  Cpu,
  ShieldCheck,
  BarChart2,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  SkillDomain,
  SkillNode,
  SkillProficiency,
  Mission,
} from '../types/career';

interface SkillTreePageProps {
  domains: SkillDomain[];
  onUpdateSkillLevel: (skillId: string, newLevel: SkillProficiency) => void;
  onOpenAIMissionModal: () => void;
  onAddMissionFromSkill: (missionTitle: string) => void;
}

export const SkillTreePage: React.FC<SkillTreePageProps> = ({
  domains,
  onUpdateSkillLevel,
  onOpenAIMissionModal,
  onAddMissionFromSkill,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  // Helper for domain icon
  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Box':
        return <Box className="w-5 h-5 text-purple-600" />;
      case 'Car':
        return <Car className="w-5 h-5 text-indigo-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5 text-amber-600" />;
      case 'Award':
      default:
        return <Award className="w-5 h-5 text-rose-600" />;
    }
  };

  // Helper for skill level badge styling
  const getLevelBadge = (level: SkillProficiency, verified: boolean) => {
    if (verified || level === '결과물로 검증됨') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-white" />
          결과물 검증됨
        </span>
      );
    }
    switch (level) {
      case '고급':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
            고급 (실무급)
          </span>
        );
      case '중급':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
            중급
          </span>
        );
      case '기초':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
            기초
          </span>
        );
      case '입문':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
            입문
          </span>
        );
      case '미평가':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400">
            미평가
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-600" />
            현대자동차 R&D 차량설계·차체해석 스킬 트리
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            자기평가에 머무르지 않고 실제 CAD 모델, CAE 해석 보고서 등 결과물로 검증된 역량을 체계적으로 확장합니다.
          </p>
        </div>

        <button
          onClick={onOpenAIMissionModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>역량 격차 분석 및 미션 생성</span>
        </button>
      </div>

      {/* Legend Banner */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <span>숙련도 상태 안내:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
            미평가
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
            입문
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-medium">
            기초
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">
            중급
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800 font-bold">
            고급
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
            ★ 결과물로 검증됨 (Deliverable Verified)
          </span>
        </div>
      </div>

      {/* 6 Great Domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {domains.map((domain) => {
          const verifiedCount = domain.skills.filter(
            (s) => s.verifiedByDeliverable || s.level === '결과물로 검증됨'
          ).length;

          return (
            <div
              key={domain.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Domain Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      {getDomainIcon(domain.iconName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {domain.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {domain.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    검증 {verifiedCount}/{domain.skills.length}
                  </span>
                </div>

                {/* Skills List in Domain */}
                <div className="p-3 divide-y divide-slate-100">
                  {domain.skills.map((skill) => (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className="py-2.5 px-3 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors">
                            {skill.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {skill.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {getLevelBadge(skill.level, skill.verifiedByDeliverable)}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-300 font-semibold block mb-0.5">
                  직무 역량 상세 카드
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedSkill.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-1">
                  역량 정의 및 설명
                </span>
                <p className="text-slate-800 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Status & Level Selection */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <div>
                  <span className="font-bold text-purple-900 block mb-1">
                    현재 평가 수준
                  </span>
                  <div>
                    {getLevelBadge(
                      selectedSkill.level,
                      selectedSkill.verifiedByDeliverable
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    수준 수동 갱신
                  </label>
                  <select
                    value={selectedSkill.level}
                    onChange={(e) => {
                      const newLvl = e.target.value as SkillProficiency;
                      onUpdateSkillLevel(selectedSkill.id, newLvl);
                      setSelectedSkill({ ...selectedSkill, level: newLvl });
                    }}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    <option value="미평가">미평가</option>
                    <option value="입문">입문</option>
                    <option value="기초">기초</option>
                    <option value="중급">중급</option>
                    <option value="고급">고급</option>
                    <option value="결과물로 검증됨">결과물로 검증됨</option>
                  </select>
                </div>
              </div>

              {/* Basis and Gaps */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-0.5">
                    평가 근거 (Evidence)
                  </span>
                  <p className="text-slate-600">
                    {selectedSkill.evaluationBasis || '근거 자료가 등록되지 않았습니다.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    부족한 부분 및 주의점 (Gaps)
                  </span>
                  <p className="text-amber-800">
                    {selectedSkill.missingParts || '아직 확인되지 않은 역량 격차입니다.'}
                  </p>
                </div>
              </div>

              {/* Recommended Missions */}
              {selectedSkill.recommendedMissions.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-2">
                    추천 실무 미션 (결과물 제작)
                  </span>
                  <div className="space-y-1.5">
                    {selectedSkill.recommendedMissions.map((rm, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-2"
                      >
                        <span className="font-semibold text-purple-950 text-xs">
                          {rm}
                        </span>
                        <button
                          onClick={() => {
                            onAddMissionFromSkill(rm);
                            setSelectedSkill(null);
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] shrink-0"
                        >
                          미션 담기
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedSkill(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
