import { runBudTurn } from '@/features/bud/bud.engine';
import type { BudChatMessage, BudTurnResult } from '@/features/bud/bud.engine.types';
import type { SessionContext } from '@/features/bud/bud.types';

import { CHAT_ERROR_REPLY } from './chat.constants';
import type { ChatSession } from './chat.session';
import type { ChatAttachment } from './chat.types';
import { buildChatHistory, buildEngineMessage } from './chat.utils';

export interface RunChatTurnInput {
  session: ChatSession;
  threadKey: string;
  text: string;
  baseContext: SessionContext;
  attachments?: ChatAttachment[];
  streamDelayMs?: number;
}

function buildMessage(
  id: string,
  role: BudChatMessage['role'],
  patch: Partial<BudChatMessage> = {},
): BudChatMessage {
  return {
    id,
    role,
    text: '',
    status: 'done',
    graphIds: [],
    redirectGraphId: null,
    confirmationGraphId: null,
    ...patch,
  };
}

export async function runChatTurn({
  session,
  threadKey,
  text,
  baseContext,
  attachments = [],
  streamDelayMs = 0,
}: RunChatTurnInput): Promise<BudTurnResult | null> {
  const { store, brain, roster, createId } = session;
  const executor = session.executorFor(threadKey);
  const thread = store.getThread(threadKey);

  const context: SessionContext = {
    ...baseContext,
    historico: buildChatHistory(thread.messages),
    grafico_em_foco: thread.focusGraphId ? executor.getActiveSpec(thread.focusGraphId) : null,
    confirmacao_pendente: thread.pendingConfirmation,
  };

  const budMessageId = createId();
  store.appendMessage(
    threadKey,
    buildMessage(createId(), 'user', {
      text,
      attachments: attachments.map(({ id, kind, name }) => ({ id, kind, name })),
    }),
  );
  store.appendMessage(threadKey, buildMessage(budMessageId, 'bud', { status: 'streaming' }));

  let streamed = '';
  try {
    let result: BudTurnResult | null = null;
    for await (const event of runBudTurn({
      message: buildEngineMessage(text, attachments),
      context,
      brain,
      executor,
      roster,
      transcript: thread.transcript,
      streamDelayMs,
    })) {
      if (event.type === 'text_delta') {
        streamed += event.delta;
        store.updateMessage(threadKey, budMessageId, { text: streamed });
      }
      if (event.type === 'done') result = event.result;
    }
    if (!result) throw new Error('Turno do Bud terminou sem resultado');

    const { drafts } = store.getState();
    store.updateMessage(threadKey, budMessageId, {
      text: result.text,
      status: 'done',
      graphIds: result.graphIds,
      redirectGraphId: result.openBuilderGraphId,
      confirmationGraphId: result.pendingConfirmation?.grafico_id ?? null,
      graphVersionIndexes: Object.fromEntries(
        result.graphIds.flatMap((graphId) =>
          drafts[graphId] ? [[graphId, drafts[graphId].activeIndex]] : [],
        ),
      ),
    });
    store.updateThread(threadKey, {
      transcript: result.transcript,
      pendingConfirmation: result.pendingConfirmation,
    });
    return result;
  } catch {
    store.updateMessage(threadKey, budMessageId, {
      text: streamed || CHAT_ERROR_REPLY,
      status: 'done',
    });
    return null;
  }
}

export interface SeedChatThreadInput {
  session: ChatSession;
  threadKey: string;
  prompts: string[];
  baseContext: SessionContext;
}

const seedingThreads = new Set<string>();

export async function seedChatThread({
  session,
  threadKey,
  prompts,
  baseContext,
}: SeedChatThreadInput): Promise<void> {
  if (seedingThreads.has(threadKey) || session.store.getThread(threadKey).messages.length > 0) {
    return;
  }

  seedingThreads.add(threadKey);
  try {
    for (const prompt of prompts) {
      await runChatTurn({ session, threadKey, text: prompt, baseContext });
    }
  } finally {
    seedingThreads.delete(threadKey);
  }
}
