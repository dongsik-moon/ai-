import {
  UserProfile,
  SkillDomain,
  Mission,
  PortfolioItem,
  DiagnosisResult,
  UserStats,
  ChatMessage,
} from '../types/career';
import {
  initialProfile,
  initialSkillDomains,
  initialMissions,
  initialPortfolioItems,
  initialDiagnosisResult,
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'cm_profile_v2',
  SKILLS: 'cm_skills_v2',
  MISSIONS: 'cm_missions_v2',
  PORTFOLIO: 'cm_portfolio_v2',
  DIAGNOSIS: 'cm_diagnosis_v2',
  STREAK_DATES: 'cm_streak_dates_v2',
  STUDY_MINUTES: 'cm_study_minutes_v2',
  CHAT: 'cm_chat_v2',
};

// Level thresholds defined in prompt
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 300 },
  { level: 3, xp: 800 },
  { level: 4, xp: 1500 },
  { level: 5, xp: 2500 },
  { level: 6, xp: 4000 },
  { level: 7, xp: 6000 },
  { level: 8, xp: 8500 },
  { level: 9, xp: 11500 },
  { level: 10, xp: 15000 },
];

export function calculateLevelAndNextXp(totalXp: number): {
  level: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let currentLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      break;
    }
  }

  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  const currentThreshold =
    LEVEL_THRESHOLDS.find((t) => t.level === currentLevel) || LEVEL_THRESHOLDS[0];

  const currentLevelBaseXp = currentThreshold.xp;
  const nextLevelXp = nextThreshold ? nextThreshold.xp : currentLevelBaseXp + 3000;

  const xpInCurrentLevel = totalXp - currentLevelBaseXp;
  const xpNeededForNext = nextLevelXp - currentLevelBaseXp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))
  );

  return {
    level: currentLevel,
    currentLevelBaseXp,
    nextLevelXp,
    progressPercent,
  };
}

export function getTodayDateStringKST(): string {
  // Returns YYYY-MM-DD in KST (UTC+9)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000);
  return kst.toISOString().split('T')[0];
}

export function calculateStreak(completionDates: string[]): number {
  if (!completionDates || completionDates.length === 0) return 0;
  const uniqueSorted = Array.from(new Set(completionDates)).sort().reverse();
  const today = getTodayDateStringKST();

  // Streak continues if latest completion was today or yesterday
  const latest = uniqueSorted[0];
  const dLatest = new Date(latest);
  const dToday = new Date(today);
  const diffDays = Math.round(
    (dToday.getTime() - dLatest.getTime()) / (1000 * 3600 * 24)
  );

  if (diffDays > 1) {
    return 0; // Streak broken
  }

  let streak = 1;
  let prevDate = dLatest;

  for (let i = 1; i < uniqueSorted.length; i++) {
    const currDate = new Date(uniqueSorted[i]);
    const diff = Math.round(
      (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24)
    );
    if (diff === 1) {
      streak++;
      prevDate = currDate;
    } else if (diff === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateJobReadiness(
  domains: SkillDomain[],
  portfolio: PortfolioItem[],
  profile: UserProfile
): number {
  // 1. Skill competence score (50% weight)
  let totalSkillWeight = 0;
  let totalSkills = 0;
  domains.forEach((d) => {
    d.skills.forEach((s) => {
      totalSkills++;
      if (s.verifiedByDeliverable) totalSkillWeight += 1.0;
      else if (s.level === '고급') totalSkillWeight += 0.85;
      else if (s.level === '중급') totalSkillWeight += 0.65;
      else if (s.level === '기초') totalSkillWeight += 0.4;
      else if (s.level === '입문') totalSkillWeight += 0.2;
      else totalSkillWeight += 0.05;
    });
  });
  const skillScore = totalSkills > 0 ? (totalSkillWeight / totalSkills) * 100 : 0;

  // 2. Portfolio completion score (30% weight)
  let portfolioWeight = 0;
  if (portfolio.length > 0) {
    portfolio.forEach((p) => {
      if (p.status === '최종 완성') portfolioWeight += 1.0;
      else if (p.status === 'AI 피드백 완료') portfolioWeight += 0.8;
      else if (p.status === '진행 중' || p.status === '개선 필요') portfolioWeight += 0.5;
      else portfolioWeight += 0.3;
    });
    // Target is at least 3 solid engineering portfolio items for Hyundai R&D
    portfolioWeight = Math.min(100, (portfolioWeight / 3) * 100);
  }

  // 3. Document and Profile completeness (20% weight)
  let docPoints = 0;
  if (profile.education && profile.major) docPoints += 20;
  if (profile.certifications && profile.certifications.length > 0) docPoints += 20;
  if (profile.experiences && profile.experiences.length > 0) docPoints += 20;
  if (profile.applicationDocuments?.coverLetter && profile.applicationDocuments.coverLetter.length > 100)
    docPoints += 20;
  if (profile.applicationDocuments?.experienceDoc && profile.applicationDocuments.experienceDoc.length > 100)
    docPoints += 20;

  const finalReadiness = Math.round(
    skillScore * 0.5 + portfolioWeight * 0.3 + docPoints * 0.2
  );
  return Math.min(99, Math.max(10, finalReadiness));
}

// Storage Manager
export const Storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialProfile;
    } catch {
      return initialProfile;
    }
  },
  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getSkills(): SkillDomain[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
      return data ? JSON.parse(data) : initialSkillDomains;
    } catch {
      return initialSkillDomains;
    }
  },
  saveSkills(skills: SkillDomain[]): void {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  getMissions(): Mission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      return data ? JSON.parse(data) : initialMissions;
    } catch {
      return initialMissions;
    }
  },
  saveMissions(missions: Mission[]): void {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  },

  getPortfolio(): PortfolioItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      return data ? JSON.parse(data) : initialPortfolioItems;
    } catch {
      return initialPortfolioItems;
    }
  },
  savePortfolio(portfolio: PortfolioItem[]): void {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
  },

  getDiagnosis(): DiagnosisResult {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIAGNOSIS);
      return data ? JSON.parse(data) : initialDiagnosisResult;
    } catch {
      return initialDiagnosisResult;
    }
  },
  saveDiagnosis(diagnosis: DiagnosisResult): void {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSIS, JSON.stringify(diagnosis));
  },

  getStreakDates(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK_DATES);
      return data ? JSON.parse(data) : ['2026-10-31', '2026-11-01', '2026-11-02'];
    } catch {
      return ['2026-11-02'];
    }
  },
  addStreakDate(dateStr: string): void {
    const dates = this.getStreakDates();
    if (!dates.includes(dateStr)) {
      dates.push(dateStr);
      localStorage.setItem(STORAGE_KEYS.STREAK_DATES, JSON.stringify(dates));
    }
  },

  getRecordedMinutes(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_MINUTES);
      return data ? Number(data) : 135;
    } catch {
      return 135;
    }
  },
  addRecordedMinutes(mins: number): void {
    const current = this.getRecordedMinutes();
    localStorage.setItem(STORAGE_KEYS.STUDY_MINUTES, String(current + mins));
  },

  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      return data
        ? JSON.parse(data)
        : [
            {
              id: 'init-msg',
              role: 'assistant',
              content:
                '안녕하세요! 현대자동차 R&D 차량설계 및 차체해석 취업 코치 Career Mission AI입니다.\n\n남양연구소 차체설계(BIW, 패키징, CATIA V5) 및 차체해석(구조/충돌/내구 CAE, FEA) 채용을 위한 직무 분석, 포트폴리오 기획, 자기소개서 첨삭, 기술 면접 답변 준비 등 무엇이든 질문하세요!',
              timestamp: '오전 10:00',
            },
          ];
    } catch {
      return [];
    }
  },
  saveChatHistory(history: ChatMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(history));
  },

  // Global reset
  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SKILLS);
    localStorage.removeItem(STORAGE_KEYS.MISSIONS);
    localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
    localStorage.removeItem(STORAGE_KEYS.DIAGNOSIS);
    localStorage.removeItem(STORAGE_KEYS.STREAK_DATES);
    localStorage.removeItem(STORAGE_KEYS.STUDY_MINUTES);
    localStorage.removeItem(STORAGE_KEYS.CHAT);
  },
};
