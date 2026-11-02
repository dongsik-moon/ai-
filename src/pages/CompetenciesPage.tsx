import React, { useState } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  FileText,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  UserProfile,
  ToolProficiency,
  ProficiencyLevel,
  ExperienceItem,
} from '../types/career';

interface CompetenciesPageProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenAIMissionModal: () => void;
}

export const CompetenciesPage: React.FC<CompetenciesPageProps> = ({
  profile,
  onSaveProfile,
  onOpenAIMissionModal,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // New course or cert inputs
  const [newCourse, setNewCourse] = useState('');
  const [newCert, setNewCert] = useState('');

  const proficiencyOptions: ProficiencyLevel[] = [
    '사용 경험 없음',
    '학습 중',
    '기초 실습 가능',
    '독립적인 과제 수행 가능',
    '결과물로 역량 입증 가능',
  ];

  const handleSave = () => {
    onSaveProfile(formData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleToolLevelChange = (index: number, level: ProficiencyLevel) => {
    const updated = [...formData.toolProficiencies];
    updated[index] = { ...updated[index], level };
    setFormData({ ...formData, toolProficiencies: updated });
  };

  const handleToolNoteChange = (index: number, note: string) => {
    const updated = [...formData.toolProficiencies];
    updated[index] = { ...updated[index], note };
    setFormData({ ...formData, toolProficiencies: updated });
  };

  const handleAddCourse = () => {
    if (!newCourse.trim()) return;
    setFormData({
      ...formData,
      relevantCourses: [...formData.relevantCourses, newCourse.trim()],
    });
    setNewCourse('');
  };

  const handleRemoveCourse = (idx: number) => {
    setFormData({
      ...formData,
      relevantCourses: formData.relevantCourses.filter((_, i) => i !== idx),
    });
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setFormData({
      ...formData,
      certifications: [...formData.certifications, newCert.trim()],
    });
    setNewCert('');
  };

  const handleRemoveCert = (idx: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== idx),
    });
  };

  // Calculate Information Completeness Meter
  const catiaProf = formData.toolProficiencies.find((t) => t.toolName.includes('CATIA'));
  const caeProf = formData.toolProficiencies.find((t) => t.toolName.includes('ANSYS') || t.toolName.includes('HyperMesh'));

  const completenessChecks = [
    {
      title: '학력 및 전공 정보',
      isComplete: !!(formData.education && formData.major && formData.gpa),
    },
    {
      title: '자격증 및 어학',
      isComplete: formData.certifications.length > 0,
    },
    {
      title: 'CAD(CATIA) 활용 수준',
      isComplete: catiaProf && catiaProf.level !== '사용 경험 없음',
    },
    {
      title: 'CAE(해석) 도구 활용 수준',
      isComplete: caeProf && caeProf.level !== '사용 경험 없음',
    },
    {
      title: '설계 및 프로젝트 경험',
      isComplete: formData.experiences.length > 0,
    },
    {
      title: '자기소개서 및 경험기술서',
      isComplete: !!(
        formData.applicationDocuments?.coverLetter &&
        formData.applicationDocuments.coverLetter.length > 50
      ),
    },
    {
      title: '목표 채용공고 정보',
      isComplete: !!formData.applicationDocuments?.jobPostingNotes,
    },
  ];

  const completedCount = completenessChecks.filter((c) => c.isComplete).length;
  const completenessPercent = Math.round(
    (completedCount / completenessChecks.length) * 100
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Save Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
            취업 목표 & 역량 프로필 관리
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            입력된 역량 데이터는 AI가 현대자동차 R&D 채용 맞춤형 진단을 내리고 미션을 생성하는 핵심 기초 자료로 활용됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>역량 프로필 저장하기</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>프로필 및 역량 데이터가 성공적으로 저장되었습니다.</span>
        </div>
      )}

      {/* G. Information Completeness Meter */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              AI 분석용 프로필 정보 완성도
            </span>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              {completenessPercent}% ({completedCount}/{completenessChecks.length})
            </span>
          </div>

          <button
            onClick={onOpenAIMissionModal}
            className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>이 정보로 AI 역량 진단 받기</span>
          </button>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completenessPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {completenessChecks.map((item, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 ${
                item.isComplete
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              {item.isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* A. 기본 프로필 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              A. 기본 프로필 & 취업 목표
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                이름 / 닉네임
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-purple-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                목표 기업
              </label>
              <input
                type="text"
                value={formData.targetCompany}
                onChange={(e) =>
                  setFormData({ ...formData, targetCompany: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                목표 직무
              </label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) =>
                  setFormData({ ...formData, targetRole: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                최종 학력
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">전공</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                학점 (GPA)
              </label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                목표 채용일 (D-Day 기준)
              </label>
              <input
                type="date"
                value={formData.targetHireDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetHireDate: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                일일 목표 투자 시간 (시간)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.dailyTargetHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyTargetHours: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                희망 근무지
              </label>
              <input
                type="text"
                value={formData.desiredLocation || '남양연구소 (화성)'}
                onChange={(e) =>
                  setFormData({ ...formData, desiredLocation: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* B. 학업 및 자격증 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              B. 수강 교과목 및 보유 자격증
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Relevant Courses */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                차체 설계 및 해석 관련 수강 교과목
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.relevantCourses.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium flex items-center gap-1"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(i)}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="예: 정역학, 재료역학, FEA개론..."
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl font-bold"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                보유 자격증 및 어학
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-medium flex items-center gap-1"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(i)}
                      className="text-purple-400 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="예: 일반기계기사, TOEIC Speaking AL..."
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl font-bold"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* D. 기술 역량 (CAD, CAE Tools) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              D. 공학 소프트웨어 및 실무 툴 숙련도
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {formData.toolProficiencies.map((tool, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="w-48 shrink-0">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {tool.toolName}
                  </h4>
                </div>

                <div className="w-64 shrink-0">
                  <select
                    value={tool.level}
                    onChange={(e) =>
                      handleToolLevelChange(
                        idx,
                        e.target.value as ProficiencyLevel
                      )
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {proficiencyOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={tool.note || ''}
                    onChange={(e) => handleToolNoteChange(idx, e.target.value)}
                    placeholder="수행 가능한 모델링 또는 해석 수준을 간단히 기재"
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* F. 지원 서류 (이력서, 자기소개서, 채용공고) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              F. 지원 서류 텍스트 등록 (이력서, 자소서, 경험기술서)
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            * 텍스트를 등록해두면 AI가 실제 문장을 읽고 현대자동차 직무 기준 첨삭 및 역량 격차를 분석합니다.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                자기소개서 초안
              </label>
              <textarea
                rows={5}
                value={formData.applicationDocuments.coverLetter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationDocuments: {
                      ...formData.applicationDocuments,
                      coverLetter: e.target.value,
                    },
                  })
                }
                placeholder="현대자동차 R&D 지원동기 및 직무 역량 중심 자기소개서를 붙여넣으세요..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                경험기술서 (STAR 기반 프로젝트 요약)
              </label>
              <textarea
                rows={5}
                value={formData.applicationDocuments.experienceDoc || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationDocuments: {
                      ...formData.applicationDocuments,
                      experienceDoc: e.target.value,
                    },
                  })
                }
                placeholder="자작차, 캡스톤, 학부 연구생 등 정량적 성과가 포함된 경험기술서를 입력하세요..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                목표 채용공고 주요 요건 메모
              </label>
              <textarea
                rows={3}
                value={formData.applicationDocuments.jobPostingNotes || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationDocuments: {
                      ...formData.applicationDocuments,
                      jobPostingNotes: e.target.value,
                    },
                  })
                }
                placeholder="채용공고에 명시된 우대사항(예: CATIA V5 활용 우수자, FEA 툴 경험자 등)을 메모하세요..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white leading-relaxed font-sans"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
