export type ProficiencyLevel =
  | '사용 경험 없음'
  | '학습 중'
  | '기초 실습 가능'
  | '독립적인 과제 수행 가능'
  | '결과물로 역량 입증 가능';

export type SkillProficiency =
  | '미평가'
  | '입문'
  | '기초'
  | '중급'
  | '고급'
  | '결과물로 검증됨';

export interface ToolProficiency {
  toolName: string;
  level: ProficiencyLevel;
  note?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  companyOrOrg?: string;
  period?: string;
  role: string;
  toolsUsed?: string;
  description: string;
  quantifiedResults?: string;
  lessonsLearned?: string;
}

export interface ApplicationDocuments {
  resume?: string;
  coverLetter?: string;
  experienceDoc?: string;
  jobPostingNotes?: string;
}

export interface UserProfile {
  name: string;
  targetCompany: string;
  targetRole: string;
  desiredLocation?: string;
  education: string;
  major: string;
  gpa: string;
  graduationYear: string;
  targetHireDate: string; // YYYY-MM-DD
  dailyTargetHours: number;
  weeklyTargetHours: number;
  relevantCourses: string[];
  certifications: string[];
  experiences: ExperienceItem[];
  toolProficiencies: ToolProficiency[];
  applicationDocuments: ApplicationDocuments;
}

export interface SkillNode {
  id: string;
  domainId: string;
  title: string;
  description: string;
  level: SkillProficiency;
  selfAssessment?: SkillProficiency;
  evaluationBasis: string;
  missingParts: string;
  recommendedMissions: string[];
  verifiedByDeliverable: boolean;
}

export interface SkillDomain {
  id: string;
  title: string;
  description: string;
  iconName: string;
  skills: SkillNode[];
}

export type MissionDifficulty = '입문' | '기초' | '중급' | '심화';
export type MissionPriority = '긴급' | '높음' | '보통';
export type MissionStatus =
  | 'planned'
  | 'in_progress'
  | 'needs_review'
  | 'completed'
  | 'on_hold';

export interface MissionDeliverable {
  summary?: string;
  content?: string;
  fileName?: string;
  submittedAt?: string;
  aiReview?: string;
}

export interface Mission {
  id: string;
  title: string;
  category: string;
  difficulty: MissionDifficulty;
  priority: MissionPriority;
  estimatedMinutes: number;
  xp: number;
  reason: string;
  targetGap: string;
  steps: string[];
  deliverables: string[];
  completionCriteria: string[];
  evaluationCriteria: string[];
  prerequisites: string[];
  nextMissionSuggestion?: string;
  status: MissionStatus;
  userDeliverable?: MissionDeliverable;
  isTodayFocus?: boolean;
  isRecommended?: boolean;
  completedAt?: string;
}

export type PortfolioCategory =
  | 'CAD 모델링'
  | '설계 프로젝트'
  | '구조해석'
  | '시험 및 검증'
  | '데이터 분석'
  | '자동차 산업 분석'
  | '기타';

export type PortfolioStatus =
  | '초안'
  | '진행 중'
  | 'AI 피드백 완료'
  | '개선 필요'
  | '최종 완성';

export interface PortfolioCritique {
  strengths: string[];
  weaknesses: string[];
  starRecommendations: string[];
  expectedInterviewQuestions: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  competenceTag: string;
  purpose: string;
  role: string;
  tools: string;
  problemDefinition: string;
  workflow: string;
  results: string;
  deliverableMeta: string;
  achievements: string;
  lessonsLearned: string;
  useInResume: boolean;
  status: PortfolioStatus;
  aiCritique?: PortfolioCritique;
  updatedAt: string;
}

export interface DiagnosisStrength {
  title: string;
  evidence: string;
  relevance: string;
}

export interface DiagnosisGap {
  skill: string;
  currentLevel: string;
  targetLevel: string;
  evidence: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  improvement: string;
}

export interface DocumentReviewItem {
  section: string;
  status: 'confirmed' | 'missing' | 'needs_work';
  finding: string;
  recommendation: string;
}

export interface TopPriorityItem {
  title: string;
  reason: string;
}

export interface DiagnosisResult {
  summary: string;
  confidence: 'high' | 'medium' | 'low';
  strengths: DiagnosisStrength[];
  gaps: DiagnosisGap[];
  documentReview: DocumentReviewItem[];
  topPriorities: TopPriorityItem[];
  diagnosedAt: string;
  suggestedMissions?: Mission[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  totalMissions: number;
  completedMissions: number;
  dailyRecordedMinutes: number;
  jobReadinessPercentage: number;
}
