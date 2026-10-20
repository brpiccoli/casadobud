import type { ChartCardAction } from '@/components/charts/ChartCard.types';
import type { BudChatMessage, GraphDraft } from '@/features/bud/bud.engine.types';

export interface ChatThreadProps {
  messages: BudChatMessage[];
  drafts: Record<string, GraphDraft>;
  onOpenGraph: (graphId: string) => void;
  onChartAction: (action: ChartCardAction, graphId: string) => void;
}

export interface ChatThreadMessageProps {
  message: BudChatMessage;
  drafts: Record<string, GraphDraft>;
  onOpenGraph: (graphId: string) => void;
  onChartAction: (action: ChartCardAction, graphId: string) => void;
}
