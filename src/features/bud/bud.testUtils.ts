import { buildSessionContext, type BuildSessionContextInput } from './bud.context';
import { runBudTurn } from './bud.engine';
import type { BudBrain, BudTurnEvent, BudTurnResult } from './bud.engine.types';
import { buildAthleteRosterMock } from './bud.mocks';
import { createBudStore } from './bud.store';
import { createBudToolExecutor } from './bud.tools';
import type { GraphSpec, SessionContext } from './bud.types';
import { createLocalBudBrain } from './localBrain';
import { fetchMetricSeries } from './metrics.service';

export const REFERENCE_DATE = new Date('2026-10-13T12:00:00');

export const THREAD_KEY = 'thread-test';

export function buildTestContext(
  overrides: Partial<BuildSessionContextInput> = {},
): SessionContext {
  return buildSessionContext({ userName: 'Bruno Perna', screen: 'chat', ...overrides });
}

export function buildTestSpec(overrides: Partial<GraphSpec> = {}): GraphSpec {
  return {
    id: 'grafico-teste',
    titulo: 'Check-ins por dia · Sub-17',
    versao: 1,
    origem: 'chat',
    tipo: 'barras',
    metrica: 'check_ins',
    periodo: { tipo: 'ultimos_dias', dias: 7 },
    categoria: ['sub_17'],
    atletas: { modo: 'todos' },
    agrupamento: 'dia_semana',
    series: [],
    ...overrides,
  };
}

export function createBudHarness(options: { brain?: BudBrain } = {}) {
  const roster = buildAthleteRosterMock();
  const store = createBudStore();
  const saved: GraphSpec[] = [];
  let idCounter = 0;

  const executor = createBudToolExecutor({
    store,
    threadKey: THREAD_KEY,
    source: 'chat',
    fetchSeries: (query) => fetchMetricSeries(query, REFERENCE_DATE),
    saveToDashboard: async (spec) => {
      saved.push(spec);
      return `dashboard-${saved.length}`;
    },
    createId: () => {
      idCounter += 1;
      return `grafico-${idCounter}`;
    },
  });

  const brain =
    options.brain ?? createLocalBudBrain({ roster, referenceDate: () => REFERENCE_DATE });

  let transcript: BudTurnResult['transcript'] = [];

  const contextFromThread = (base: SessionContext): SessionContext => {
    const thread = store.getThread(THREAD_KEY);
    return {
      ...base,
      grafico_em_foco: thread.focusGraphId ? executor.getActiveSpec(thread.focusGraphId) : null,
      confirmacao_pendente: thread.pendingConfirmation,
    };
  };

  const send = async (message: string, base: SessionContext = buildTestContext()) => {
    const events: BudTurnEvent[] = [];
    let result: BudTurnResult | undefined;
    for await (const event of runBudTurn({
      message,
      context: contextFromThread(base),
      brain,
      executor,
      roster,
      transcript,
    })) {
      events.push(event);
      if (event.type === 'done') result = event.result;
    }
    if (!result) throw new Error('Turno terminou sem resultado');
    transcript = result.transcript;
    store.updateThread(THREAD_KEY, { pendingConfirmation: result.pendingConfirmation });

    const toolNames = events.flatMap((event) =>
      event.type === 'tool_call' ? [event.call.nome] : [],
    );
    return { result, events, toolNames };
  };

  return { roster, store, executor, brain, saved, send };
}
