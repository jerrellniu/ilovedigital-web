// Shared shapes for the instant website audit.
//
// A finding is always measured, never inferred. Every number a visitor sees comes
// from a check in this folder, and the interpretation step is only allowed to
// reorder and explain findings, never to add figures of its own (see interpret.ts).

export type Category = 'technical' | 'onpage' | 'speed' | 'geo';
export type Status = 'pass' | 'warn' | 'fail' | 'info';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Finding {
  /** Stable id, e.g. "tech.https". Used to match interpretation back to findings. */
  id: string;
  category: Category;
  status: Status;
  priority: Priority;
  /** Short, plain-English name of the check. */
  title: string;
  /** What we measured, in a full sentence. Carries the evidence figures. */
  detail: string;
  /** What to do about it, in a full sentence. Empty for passes. */
  fix: string;
  /** Up to five affected URLs, when the check is per page. */
  urls?: string[];
}

export interface PageSnapshot {
  url: string;
  status: number;
  title: string | null;
  description: string | null;
  h1: string[];
  canonical: string | null;
  noindex: boolean;
  lang: string | null;
  viewport: boolean;
  wordCount: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  schemaTypes: string[];
  ogTitle: boolean;
  ogImage: boolean;
  internalLinks: string[];
  mixedContent: number;
  ms: number;
}

export interface SpeedResult {
  strategy: 'mobile' | 'desktop';
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  /** Lab metrics, display strings straight from Lighthouse. */
  lcp: string | null;
  cls: string | null;
  tbt: string | null;
  fcp: string | null;
  /** Field data from real Chrome users, when Google has enough of it. */
  fieldLcpMs: number | null;
  fieldInpMs: number | null;
  fieldCls: number | null;
  fieldCategory: string | null;
}

export interface CategoryScore {
  category: Category;
  label: string;
  /** 0 to 100, from pass/warn/fail counts. Null when nothing in the category ran. */
  score: number | null;
  passed: number;
  total: number;
}

export interface PlanMonth {
  month: string;
  items: string[];
}

export interface Interpretation {
  summary: string;
  topPriorities: { findingId: string; why: string }[];
  plan: PlanMonth[];
  /** 'model' when Claude wrote it and it passed the figures check; 'rules' otherwise. */
  source: 'model' | 'rules';
}

export interface AuditReport {
  id: string;
  url: string;
  finalUrl: string;
  host: string;
  business: string | null;
  createdAt: string;
  pagesChecked: string[];
  scores: CategoryScore[];
  overall: number | null;
  findings: Finding[];
  speed: SpeedResult[];
  interpretation: Interpretation;
  /** Things we could not check, so the report never implies a pass it did not measure. */
  notChecked: string[];
}

export type ProgressStep =
  | 'fetch'
  | 'crawl'
  | 'technical'
  | 'speed'
  | 'geo'
  | 'interpret'
  | 'done';

export type AuditEvent =
  | { type: 'progress'; step: ProgressStep; label: string }
  | { type: 'report'; report: AuditReport }
  | { type: 'error'; message: string };
