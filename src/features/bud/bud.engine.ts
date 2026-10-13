import { BUD_MAX_TOOL_ROUNDS } from './bud.constants';
import type {
  BudBrain,
  BudToolExecutor,
  BudTranscriptItem,
  BudTurnEvent,
  BudTurnResult,
} from './bud.engine.types';
import { sanitizeBudCopy } from './bud.guardrails';
import { buildPendingConfirmation } from './bud.store';
import type { Athlete, BudToolOutcome, SessionContext } from './bud.types';
import { buildBudSystemPrompt } from './bud.prompt';

export interface RunBudTurnInput {
  message: string;
  context: SessionContext;
  brain: BudBrain;
  executor: BudToolExecutor;
  roster: Athlete[];
  transcript?: BudTranscriptItem[];
  streamDelayMs?: number;
}

const WORD_CHUNK_PATTERN = /\S+\s*/g;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyOutcome(
  result: BudTurnResult,
  outcome: BudToolOutcome,
  executor: BudToolExecutor,
): BudTurnResult {
  if (!outcome.ok) return result;

  switch (outcome.nome) {
    case 'criar_grafico':
    case 'ajustar_grafico': {
      const spec = executor.getActiveSpec(outcome.dados.id);
      return {
        ...result,
        graphIds: [...result.graphIds.filter((id) => id !== outcome.dados.id), outcome.dados.id],
        context: { ...result.context, grafico_em_foco: spec, confirmacao_pendente: null },
      };
    }
    case 'salvar_grafico': {
      if (outcome.dados.status === 'aguardando_confirmacao') {
        return { ...result, pendingConfirmation: buildPendingConfirmation(outcome.dados.id) };
      }
      return {
        ...result,
        savedGraphId: outcome.dados.id,
        pendingConfirmation: null,
        context: { ...result.context, confirmacao_pendente: null },
      };
    }
    case 'descartar_grafico':
      return {
        ...result,
        discardedGraphId: outcome.dados.id,
        graphIds: result.graphIds.filter((id) => id !== outcome.dados.id),
        pendingConfirmation: null,
        context: { ...result.context, grafico_em_foco: null, confirmacao_pendente: null },
      };
    case 'abrir_no_builder':
      return { ...result, openBuilderGraphId: outcome.dados.id };
    case 'confirmar_por_voz':
      return {
        ...result,
        voiceAnswer: outcome.dados.status,
        savedGraphId: outcome.dados.status === 'salvo' ? outcome.dados.id : result.savedGraphId,
        pendingConfirmation: null,
        context: { ...result.context, confirmacao_pendente: null },
      };
    case 'consultar_metricas':
      return result;
  }
}

export async function* runBudTurn({
  message,
  context,
  brain,
  executor,
  roster,
  transcript = [],
  streamDelayMs = 0,
}: RunBudTurnInput): AsyncGenerator<BudTurnEvent, BudTurnResult> {
  const working: BudTranscriptItem[] = [...transcript, { type: 'user', text: message }];
  const texts: string[] = [];
  let result: BudTurnResult = {
    text: '',
    graphIds: [],
    openBuilderGraphId: null,
    pendingConfirmation: null,
    savedGraphId: null,
    discardedGraphId: null,
    voiceAnswer: null,
    context: {
      ...context,
      historico: [...context.historico, { papel: 'usuario', texto: message }],
    },
    transcript: working,
  };

  for (let round = 0; round < BUD_MAX_TOOL_ROUNDS; round += 1) {
    const step = await brain.step({
      systemPrompt: buildBudSystemPrompt(result.context, roster),
      context: result.context,
      transcript: working,
    });

    const text = sanitizeBudCopy(step.text.trim());
    if (text) {
      const separator = texts.length > 0 ? '\n\n' : '';
      texts.push(text);
      working.push({ type: 'bud', text });
      for (const chunk of `${separator}${text}`.match(WORD_CHUNK_PATTERN) ?? []) {
        if (streamDelayMs > 0) await wait(streamDelayMs);
        yield { type: 'text_delta', delta: chunk };
      }
    }

    if (step.toolCalls.length === 0) break;

    for (const call of step.toolCalls) {
      yield { type: 'tool_call', call };
      const outcome = await executor.execute(call, result.context);
      working.push({ type: 'tool_call', call }, { type: 'tool_result', callId: call.id, outcome });
      result = applyOutcome(result, outcome, executor);
      yield { type: 'tool_result', call, outcome };
    }
  }

  const finalText = texts.join('\n\n');
  result = {
    ...result,
    text: finalText,
    transcript: working,
    context: {
      ...result.context,
      historico: finalText
        ? [...result.context.historico, { papel: 'bud', texto: finalText }]
        : result.context.historico,
    },
  };
  yield { type: 'done', result };
  return result;
}
