import { ROUTES } from '@/constants/routes';

import type { BudToolExecutor, GraphDraftSource } from './bud.engine.types';
import { isIllustrativeData } from './bud.guardrails';
import { buildPendingConfirmation, getActiveSpec, type BudStore } from './bud.store';
import type {
  BudCategory,
  BudToolArgsMap,
  BudToolCall,
  BudToolError,
  BudToolName,
  BudToolOutcome,
  BudToolResultMap,
  GraphSpec,
  GraphSpecPatch,
  MetricQuery,
  Serie,
  SessionContext,
} from './bud.types';
import {
  applyGraphPatch,
  buildGraphTitle,
  hasSeriesData,
  toMetricQuery,
  validateGraphSpec,
} from './graphSpec.utils';

export interface BudToolExecutorDeps {
  store: BudStore;
  threadKey: string;
  source: GraphDraftSource;
  fetchSeries: (query: MetricQuery) => Promise<Serie[]>;
  saveToDashboard: (spec: GraphSpec) => Promise<string>;
  createId: () => string;
}

export interface BudGraphActions extends BudToolExecutor {
  createGraph: (
    spec: BudToolArgsMap['criar_grafico']['spec'],
    context: SessionContext,
  ) => Promise<BudToolOutcome>;
  updateActiveVersion: (
    graphId: string,
    patch: GraphSpecPatch,
    context: SessionContext,
  ) => Promise<BudToolOutcome>;
  confirmSave: (graphId: string) => Promise<BudToolOutcome>;
}

function success<Name extends BudToolName>(
  nome: Name,
  dados: BudToolResultMap[Name],
): BudToolOutcome {
  return { ok: true, nome, dados } as BudToolOutcome;
}

function failure(nome: BudToolName, error: BudToolError): BudToolOutcome {
  return { ...error, nome };
}

function notFound(nome: BudToolName, graphId: string): BudToolOutcome {
  return failure(nome, {
    ok: false,
    erro: 'grafico_nao_encontrado',
    mensagem: `Não encontrei o gráfico ${graphId}.`,
  });
}

function noData(nome: BudToolName): BudToolOutcome {
  return failure(nome, {
    ok: false,
    erro: 'sem_dados',
    mensagem: 'Não há dados para esse período, categoria ou seleção de atletas.',
  });
}

function buildQueryProbe(query: MetricQuery): GraphSpec {
  return {
    ...query,
    id: 'consulta',
    titulo: '',
    versao: 1,
    origem: 'chat',
    tipo: 'barras',
    series: [],
  };
}

export function createBudToolExecutor(deps: BudToolExecutorDeps): BudGraphActions {
  const { store } = deps;

  const allowedCategories = (context: SessionContext): BudCategory[] =>
    context.usuario.categorias_permitidas;

  const findDraft = (graphId: string) => {
    const draft = store.getState().drafts[graphId];
    if (!draft || draft.status === 'discarded') return null;
    return draft;
  };

  const withSeries = async (
    nome: BudToolName,
    spec: GraphSpec,
    context: SessionContext,
  ): Promise<{ ok: true; spec: GraphSpec } | { ok: false; outcome: BudToolOutcome }> => {
    const validation = validateGraphSpec(spec, allowedCategories(context));
    if (!validation.ok) return { ok: false, outcome: failure(nome, validation) };

    const series = await deps.fetchSeries(toMetricQuery(validation.spec));
    if (!hasSeriesData(series)) return { ok: false, outcome: noData(nome) };
    return { ok: true, spec: { ...validation.spec, series } };
  };

  const save = async (nome: BudToolName, graphId: string): Promise<BudToolOutcome | null> => {
    const spec = getActiveSpec(findDraft(graphId) ?? undefined);
    if (!spec) return notFound(nome, graphId);
    const dashboardChartId = await deps.saveToDashboard(spec);
    store.setDraftStatus(graphId, 'saved', dashboardChartId);
    store.updateThread(deps.threadKey, { pendingConfirmation: null });
    return null;
  };

  const handlers: {
    [Name in BudToolName]: (
      args: BudToolArgsMap[Name],
      context: SessionContext,
    ) => Promise<BudToolOutcome>;
  } = {
    consultar_metricas: async (query, context) => {
      const validation = validateGraphSpec(buildQueryProbe(query), allowedCategories(context));
      if (!validation.ok) return failure('consultar_metricas', validation);
      const series = await deps.fetchSeries(toMetricQuery(validation.spec));
      return success('consultar_metricas', {
        series,
        ilustrativo: isIllustrativeData(context.dados_modo),
      });
    },
    criar_grafico: async ({ spec }, context) => {
      const draftSpec: GraphSpec = {
        ...spec,
        id: deps.createId(),
        versao: 1,
        titulo: spec.titulo?.trim() || buildGraphTitle(spec),
        series: [],
      };
      const prepared = await withSeries('criar_grafico', draftSpec, context);
      if (!prepared.ok) return prepared.outcome;

      store.createDraft(prepared.spec, deps.source);
      if (spec.titulo?.trim()) store.renameDraft(prepared.spec.id, prepared.spec.titulo);
      store.updateThread(deps.threadKey, { focusGraphId: prepared.spec.id });
      return success('criar_grafico', { id: prepared.spec.id, versao: 1 });
    },
    ajustar_grafico: async ({ id, patch }, context) => {
      const draft = findDraft(id);
      const current = getActiveSpec(draft ?? undefined);
      if (!draft || !current) return notFound('ajustar_grafico', id);

      const latestVersion = Math.max(...draft.versions.map((version) => version.versao));
      const next = applyGraphPatch({ ...current, versao: latestVersion }, patch, {
        keepTitle: draft.titleLocked,
      });
      const prepared = await withSeries('ajustar_grafico', next, context);
      if (!prepared.ok) return prepared.outcome;

      store.addDraftVersion(id, prepared.spec);
      if (patch.titulo) store.renameDraft(id, patch.titulo);
      store.updateThread(deps.threadKey, { focusGraphId: id });
      return success('ajustar_grafico', { id, versao: prepared.spec.versao });
    },
    salvar_grafico: async ({ id }, context) => {
      if (!findDraft(id)) return notFound('salvar_grafico', id);

      if (context.confirmacao_pendente?.grafico_id !== id) {
        store.updateThread(deps.threadKey, { pendingConfirmation: buildPendingConfirmation(id) });
        return success('salvar_grafico', { id, status: 'aguardando_confirmacao' });
      }

      const error = await save('salvar_grafico', id);
      return error ?? success('salvar_grafico', { id, status: 'salvo' });
    },
    descartar_grafico: async ({ id }) => {
      if (!findDraft(id)) return notFound('descartar_grafico', id);
      store.setDraftStatus(id, 'discarded');
      store.updateThread(deps.threadKey, { focusGraphId: null, pendingConfirmation: null });
      return success('descartar_grafico', { id, status: 'descartado' });
    },
    abrir_no_builder: async ({ id }) => {
      if (!findDraft(id)) return notFound('abrir_no_builder', id);
      return success('abrir_no_builder', { id, rota: `${ROUTES.chartBuilder}/${id}` });
    },
    confirmar_por_voz: async ({ id, resposta }, context) => {
      if (context.modo !== 'voz_ao_vivo') {
        return failure('confirmar_por_voz', {
          ok: false,
          erro: 'fora_do_modo_voz',
          mensagem: 'A confirmação por voz só existe no modo voz ao vivo.',
        });
      }
      if (!findDraft(id)) return notFound('confirmar_por_voz', id);

      if (resposta === 'ajustar') {
        store.updateThread(deps.threadKey, { pendingConfirmation: null, focusGraphId: id });
        return success('confirmar_por_voz', { id, status: 'ajustando' });
      }

      const error = await save('confirmar_por_voz', id);
      return error ?? success('confirmar_por_voz', { id, status: 'salvo' });
    },
  };

  const execute = (call: BudToolCall, context: SessionContext): Promise<BudToolOutcome> => {
    const handler = handlers[call.nome] as (
      args: BudToolCall['argumentos'],
      context: SessionContext,
    ) => Promise<BudToolOutcome>;
    return handler(call.argumentos, context);
  };

  return {
    execute,
    getActiveSpec: (graphId) => getActiveSpec(findDraft(graphId) ?? undefined),
    createGraph: (spec, context) => handlers.criar_grafico({ spec }, context),
    updateActiveVersion: async (graphId, patch, context) => {
      const draft = findDraft(graphId);
      const current = getActiveSpec(draft ?? undefined);
      if (!draft || !current) return notFound('ajustar_grafico', graphId);

      const next = applyGraphPatch(current, patch, { keepTitle: draft.titleLocked });
      const prepared = await withSeries(
        'ajustar_grafico',
        { ...next, versao: current.versao },
        context,
      );
      if (!prepared.ok) return prepared.outcome;

      store.replaceActiveVersion(graphId, prepared.spec);
      return success('ajustar_grafico', { id: graphId, versao: current.versao });
    },
    confirmSave: async (graphId) => {
      const error = await save('salvar_grafico', graphId);
      return error ?? success('salvar_grafico', { id: graphId, status: 'salvo' });
    },
  };
}
