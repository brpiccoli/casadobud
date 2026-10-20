import type { BudChatMessage, GraphDraft } from '@/features/bud/bud.engine.types';

export interface ChartBuilderRailProps {
  title: string;
  fromChat: boolean;
  messages: BudChatMessage[];
  draft: GraphDraft | null;
  streaming: boolean;
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSubmit: (message: string) => void;
  onSelectVersion: (index: number) => void;
}
