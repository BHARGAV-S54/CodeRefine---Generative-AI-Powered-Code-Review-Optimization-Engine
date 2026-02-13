
export enum Severity {
<<<<<<< HEAD
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface AnalysisResult {
  critical: number;
  high: number;
  medium: number;
  low: number;
  content: string;
}

export interface RewrittenResult {
  explanation: string;
  code: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ActiveTab = 'editor' | 'review' | 'rewrite' | 'run' | 'help';

export interface AppState {
  code: string;
  language: string;
  analysis: AnalysisResult | null;
  rewritten: RewrittenResult | null;
  output: { stdout: string; stderr: string; html?: string } | null;
  isLoading: boolean;
  activeTab: ActiveTab;
=======
  CRITICAL = 'Critical Issues',
  HIGH = 'High Priority',
  MEDIUM = 'Medium Priority',
  LOW = 'Low Priority'
}

export interface CodeReviewResult {
  counts: Record<string, number>;
  markdown: string;
  suggestions: Array<{
    severity: string;
    line?: number;
    issue: string;
    recommendation: string;
  }>;
}

export type ReviewAnalysis = CodeReviewResult;

export interface CodeRewriteResult {
  rewrittenCode: string;
  summary: string;
  improvements: string[];
  explanation: string;
}

export interface TerminalOutput {
  stdout: string;
  stderr: string;
}

export type TabType = 'editor' | 'review' | 'rewrite' | 'output' | 'history';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  type: 'Review' | 'Rewrite' | 'Run';
  language: string;
  codePreview: string;
  resultSummary?: string;
  fullCode: string;
  result: any; // Stores ReviewAnalysis, CodeRewriteResult, or TerminalOutput
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  email: string;
  name: string;
  role?: string;
>>>>>>> 3388560 (first commit)
}
