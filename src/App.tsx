import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AIMissionModal } from './components/AIMissionModal';
import { MissionCompleteModal } from './components/MissionCompleteModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { SkillTreePage } from './pages/SkillTreePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { CoachPage } from './pages/CoachPage';
import { CompetenciesPage } from './pages/CompetenciesPage';
import { SettingsPage } from './pages/SettingsPage';

// Types and Storage
import {
  UserProfile,
  SkillDomain,
  Mission,
  PortfolioItem,
  DiagnosisResult,
  UserStats,
  ChatMessage,
  MissionStatus,
  SkillProficiency,
  MissionDeliverable,
} from './types/career';
import {
  Storage,
  calculateLevelAndNextXp,
  calculateStreak,
  calculateJobReadiness,
  getTodayDateStringKST,
} from './utils/storage';
import {
  initialProfile,
  initialSkillDomains,
  initialMissions,
  initialPortfolioItems,
  initialDiagnosisResult,
} from './data/initialData';
import { Menu, X } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data States
  const [profile, setProfile] = useState<UserProfile>(() => Storage.getProfile());
  const [skills, setSkills] = useState<SkillDomain[]>(() => Storage.getSkills());
  const [missions, setMissions] = useState<Mission[]>(() => Storage.getMissions());
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() =>
    Storage.getPortfolio()
  );
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>(() =>
    Storage.getDiagnosis()
  );
  const [streakDates, setStreakDates] = useState<string[]>(() =>
    Storage.getStreakDates()
  );
  const [recordedMinutes, setRecordedMinutes] = useState<number>(() =>
    Storage.getRecordedMinutes()
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    Storage.getChatHistory()
  );

  // Modals
  const [isAIMissionModalOpen, setIsAIMissionModalOpen] = useState(false);
  const [missionToComplete, setMissionToComplete] = useState<Mission | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Synchronize storage whenever state changes
  useEffect(() => {
    Storage.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    Storage.saveSkills(skills);
  }, [skills]);

  useEffect(() => {
    Storage.saveMissions(missions);
  }, [missions]);

  useEffect(() => {
    Storage.savePortfolio(portfolioItems);
  }, [portfolioItems]);

  useEffect(() => {
    Storage.saveDiagnosis(diagnosis);
  }, [diagnosis]);

  useEffect(() => {
    Storage.saveChatHistory(chatHistory);
  }, [chatHistory]);

  // Compute total XP strictly from completed missions
  const totalXp = useMemo(() => {
    const earnedFromMissions = missions
      .filter((m) => m.status === 'completed')
      .reduce((acc, m) => acc + (m.xp || 0), 0);
    // Base starter XP for initial level 3 demo feel
    return Math.max(820, earnedFromMissions + 820);
  }, [missions]);

  const levelInfo = useMemo(() => {
    return calculateLevelAndNextXp(totalXp);
  }, [totalXp]);

  const streakDays = useMemo(() => {
    return calculateStreak(streakDates);
  }, [streakDates]);

  const jobReadinessPercentage = useMemo(() => {
    return calculateJobReadiness(skills, portfolioItems, profile);
  }, [skills, portfolioItems, profile]);

  const stats: UserStats = {
    level: levelInfo.level,
    xp: totalXp,
    nextLevelXp: levelInfo.nextLevelXp,
    streakDays: Math.max(3, streakDays),
    totalMissions: missions.length,
    completedMissions: missions.filter((m) => m.status === 'completed').length,
    dailyRecordedMinutes: recordedMinutes,
    jobReadinessPercentage,
  };

  // Action: Complete a mission with deliverables & award XP without duplicates
  const handleCompleteMission = (
    missionId: string,
    deliverable: MissionDeliverable
  ) => {
    const today = getTodayDateStringKST();

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && m.status !== 'completed') {
          return {
            ...m,
            status: 'completed',
            completedAt: today,
            userDeliverable: deliverable,
          };
        }
        return m;
      })
    );

    // Record streak date
    Storage.addStreakDate(today);
    setStreakDates((prev) => (prev.includes(today) ? prev : [...prev, today]));

    // Add study minutes
    const targetMission = missions.find((m) => m.id === missionId);
    const addedTime = targetMission?.estimatedMinutes || 60;
    Storage.addRecordedMinutes(addedTime);
    setRecordedMinutes((prev) => prev + addedTime);

    // Enhance related skill in skill tree to '결과물로 검증됨' if applicable
    if (targetMission) {
      setSkills((prevDomains) =>
        prevDomains.map((dom) => ({
          ...dom,
          skills: dom.skills.map((sk) => {
            if (
              sk.title.toLowerCase().includes(targetMission.title.slice(0, 6).toLowerCase()) ||
              targetMission.title.includes(sk.title.slice(0, 5)) ||
              targetMission.targetGap.includes(sk.title.slice(0, 4))
            ) {
              return {
                ...sk,
                verifiedByDeliverable: true,
                level: '결과물로 검증됨',
                evaluationBasis: `[미션 완료] "${targetMission.title}" 결과물 등록으로 역량 검증 완료`,
              };
            }
            return sk;
          }),
        }))
      );
    }
  };

  // Action: Add new AI generated missions
  const handleAddMissions = (newMissions: Mission[]) => {
    setMissions((prev) => [...newMissions, ...prev]);
  };

  // Action: Add single mission to Today's Focus
  const handleAddMissionToFocus = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, isTodayFocus: true } : m))
    );
  };

  // Action: Update mission status
  const handleUpdateMissionStatus = (
    missionId: string,
    newStatus: MissionStatus
  ) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
    );
  };

  // Action: Update skill level
  const handleUpdateSkillLevel = (
    skillId: string,
    newLevel: SkillProficiency
  ) => {
    setSkills((prevDomains) =>
      prevDomains.map((dom) => ({
        ...dom,
        skills: dom.skills.map((sk) =>
          sk.id === skillId
            ? {
                ...sk,
                level: newLevel,
                verifiedByDeliverable: newLevel === '결과물로 검증됨',
              }
            : sk
        ),
      }))
    );
  };

  // Action: Add / Update portfolio item
  const handleSavePortfolioItem = (item: PortfolioItem) => {
    setPortfolioItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = item;
        return updated;
      }
      return [item, ...prev];
    });
  };

  // Action: Delete portfolio item
  const handleDeletePortfolioItem = (id: string) => {
    setPortfolioItems((prev) => prev.filter((p) => p.id !== id));
  };

  // Action: Add mission from skill node recommended list
  const handleAddMissionFromSkill = (missionTitle: string) => {
    const newMission: Mission = {
      id: `skill-rec-${Date.now()}`,
      title: missionTitle,
      category: '차량설계 및 차체해석',
      difficulty: '중급',
      priority: '높음',
      estimatedMinutes: 120,
      xp: 150,
      reason: '스킬 트리에서 역량 검증을 위해 직접 추가한 실무 미션입니다.',
      targetGap: '차체 설계 및 해석 결과물 확보',
      steps: [
        '해당 부품 및 해석 모델의 설계 의도를 분석합니다.',
        'CATIA 또는 CAE 도구로 작업을 수행합니다.',
        '결과물과 설계 보고서를 등록합니다.',
      ],
      deliverables: ['설계 캡처 또는 해석 기술 리포트'],
      completionCriteria: ['실무 요건 충족 및 공학적 근거 명시'],
      evaluationCriteria: ['완성도 및 타당성'],
      prerequisites: [],
      status: 'planned',
      isTodayFocus: true,
    };
    handleAddMissions([newMission]);
    setCurrentTab('missions');
  };

  // Action: Reset all data
  const handleResetAllData = () => {
    Storage.resetAll();
    setProfile(initialProfile);
    setSkills(initialSkillDomains);
    setMissions(initialMissions);
    setPortfolioItems(initialPortfolioItems);
    setDiagnosis(initialDiagnosisResult);
    setStreakDates(['2026-10-31', '2026-11-01', '2026-11-02']);
    setRecordedMinutes(135);
    setChatHistory(Storage.getChatHistory());
  };

  // Action: Import data from json
  const handleImportData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (data.missions) setMissions(data.missions);
      if (data.skills) setSkills(data.skills);
      if (data.portfolioItems) setPortfolioItems(data.portfolioItems);
      return true;
    } catch {
      return false;
    }
  };

  // Render active page
  const renderPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            profile={profile}
            stats={stats}
            missions={missions}
            onOpenCompleteModal={(mission) => {
              setMissionToComplete(mission);
              setIsCompleteModalOpen(true);
            }}
            onOpenAIMissionModal={() => setIsAIMissionModalOpen(true)}
            onNavigateToMissions={() => setCurrentTab('missions')}
            onAddMissionToFocus={handleAddMissionToFocus}
          />
        );
      case 'missions':
        return (
          <MissionsPage
            missions={missions}
            onOpenCompleteModal={(mission) => {
              setMissionToComplete(mission);
              setIsCompleteModalOpen(true);
            }}
            onOpenAIMissionModal={() => setIsAIMissionModalOpen(true)}
            onUpdateMissionStatus={handleUpdateMissionStatus}
          />
        );
      case 'skills':
        return (
          <SkillTreePage
            domains={skills}
            onUpdateSkillLevel={handleUpdateSkillLevel}
            onOpenAIMissionModal={() => setIsAIMissionModalOpen(true)}
            onAddMissionFromSkill={handleAddMissionFromSkill}
          />
        );
      case 'portfolio':
        return (
          <PortfolioPage
            portfolioItems={portfolioItems}
            onSavePortfolioItem={handleSavePortfolioItem}
            onDeletePortfolioItem={handleDeletePortfolioItem}
          />
        );
      case 'coach':
        return (
          <CoachPage
            chatHistory={chatHistory}
            onSaveChatHistory={setChatHistory}
            profile={profile}
          />
        );
      case 'competencies':
        return (
          <CompetenciesPage
            profile={profile}
            onSaveProfile={setProfile}
            onOpenAIMissionModal={() => setIsAIMissionModalOpen(true)}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            profile={profile}
            stats={stats}
            onSaveProfile={setProfile}
            onResetAllData={handleResetAllData}
            onImportData={handleImportData}
          />
        );
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return '취업 미션 대시보드';
      case 'missions':
        return '나의 미션 목록';
      case 'skills':
        return '직무 역량 스킬 트리';
      case 'portfolio':
        return 'R&D 설계·해석 포트폴리오';
      case 'coach':
        return 'AI 취업 전담 코치';
      case 'competencies':
        return '취업 목표 & 역량 프로필';
      case 'settings':
        return '환경 설정 & 데이터';
      default:
        return 'Career Mission AI';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans text-slate-800">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
          onOpenAIMissionModal={() => setIsAIMissionModalOpen(true)}
          profile={profile}
          stats={stats}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-72 bg-white h-full flex flex-col">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                onOpenAIMissionModal={() => {
                  setIsMobileMenuOpen(false);
                  setIsAIMissionModalOpen(true);
                }}
                profile={profile}
                stats={stats}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Mobile top toggle bar */}
        <div className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-extrabold text-sm text-purple-900">
            Career Mission <span className="text-purple-600">AI</span>
          </div>
          <div className="text-xs font-bold text-purple-700">
            LV.{stats.level}
          </div>
        </div>

        {/* Global Header */}
        <Header
          title={getPageTitle()}
          subtitle="현대자동차 R&D 본부 차량설계 및 차체해석 엔지니어 취업 준비 특화 플랫폼"
          profile={profile}
          stats={stats}
          onOpenAIMissionModal={() => setIsAIMissionModalOpen(true)}
          onNavigateToCompetencies={() => setCurrentTab('competencies')}
        />

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Core Feature: AI Mission & Diagnosis Modal */}
      <AIMissionModal
        isOpen={isAIMissionModalOpen}
        onClose={() => setIsAIMissionModalOpen(false)}
        profile={profile}
        skills={skills}
        missions={missions}
        portfolioItems={portfolioItems}
        diagnosis={diagnosis}
        onSaveDiagnosis={setDiagnosis}
        onAddMissions={handleAddMissions}
      />

      {/* Mission Complete & Deliverable Registration Modal */}
      <MissionCompleteModal
        isOpen={isCompleteModalOpen}
        mission={missionToComplete}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setMissionToComplete(null);
        }}
        onComplete={handleCompleteMission}
      />
    </div>
  );
}
