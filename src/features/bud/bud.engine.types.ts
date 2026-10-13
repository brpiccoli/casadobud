import type {
  BudToolCall,
  BudToolOutcome,
  GraphSpec,
  PendingConfirmation,
  SessionContext,
} from './bud.types';

export type BudTranscriptItem =
  | { type: 'user'; text: string }
  | { type: 'bud'; text: string }
  | { type: 'tool_call'; call: BudToolCall }
  | { type: 'tool_result'; callId: string; outcome: BudToolOutcome };

export interface BudBrainInput {
  systemPrompt: string;
  context: SessionContext;
  transcript: BudTranscriptItem[];
}

export interface BudBrainStep {
  text: string;
  toolCalls: BudToolCall[];
}

export interface BudBrain {
  step: (input: BudBrainInput) => Promise<BudBrainStep>;
}

export interface BudToolExecutor {
  execute: (call: BudToolCall, context: SessionContext) => Promise<BudToolOutcome>;
  getActiveSpec: (graphId: string) => GraphSpec | null;
}

export interface BudTurnResult {
  text: string;
  graphIds: string[];
  openBuilderGraphId: string | null;
  pendingConfirmation: PendingConfirmation | null;
  savedGraphId: string | null;
  discardedGraphId: string | null;
  voiceAnswer: 'salvo' | 'ajustando' | null;
  context: SessionContext;
  transcript: BudTranscriptItem[];
}

export type BudTurnEvent =
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_call'; call: BudToolCall }
  | { type: 'tool_result'; call: BudToolCall; outcome: BudToolOutcome }
  | { type: 'done'; result: BudTurnResult };

export type GraphDraftStatus = 'draft' | 'saved' | 'discarded';

export type GraphDraftSource = 'chat' | 'dashboard' | 'voice';

export interface GraphDraft {
  id: string;
  versions: GraphSpec[];
  versionLabels: string[];
  activeIndex: number;
  titleLocked: boolean;
  status: GraphDraftStatus;
  source: GraphDraftSource;
  dashboardChartId: string | null;
}

export type BudMessageRole = 'user' | 'bud';

export interface BudChatMessage {
  id: string;
  role: BudMessageRole;
  text: string;
  status: 'streaming' | 'done';
  graphIds: string[];
  redirectGraphId: string | null;
  confirmationGraphId: string | null;
}

export interface BudThread {
  messages: BudChatMessage[];
  transcript: BudTranscriptItem[];
  focusGraphId: string | null;
  pendingConfirmation: PendingConfirmation | null;
}

export interface BudState {
  drafts: Record<string, GraphDraft>;
  threads: Record<string, BudThread>;
}
