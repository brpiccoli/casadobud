import { ROUTES } from '@/constants/routes';

import { THREAD_KEY, buildTestContext, createBudHarness } from './bud.testUtils';
import type { BudToolCall, GraphSpecInput } from './bud.types';

const SPEC_INPUT: GraphSpecInput = {
  origem: 'chat',
  tipo: 'barras',
  metrica: 'check_ins',
  periodo: { tipo: 'ultimos_dias', dias: 7 },
  categoria: ['sub_17'],
  atletas: { modo: 'todos' },
  agrupamento: 'dia_semana',
};

function call(nome: BudToolCall['nome'], argumentos: unknown): BudToolCall {
  return { id: `call-${nome}`, nome, argumentos } as BudToolCall;
}

async function createDraft(harness: ReturnType<typeof createBudHarness>) {
  const outcome = await harness.executor.execute(
    call('criar_grafico', { spec: SPEC_INPUT }),
    buildTestContext(),
  );
  if (!outcome.ok || outcome.nome !== 'criar_grafico') throw new Error('falhou ao criar');
  return outcome.dados.id;
}

describe('executor das tools', () => {
  it('consultar_metricas devolve séries e sinaliza dado ilustrativo', async () => {
    const harness = createBudHarness();
    const outcome = await harness.executor.execute(
      call('consultar_metricas', {
        metrica: 'check_ins',
        periodo: { tipo: 'ultimos_dias', dias: 7 },
        categoria: ['sub_17'],
        atletas: { modo: 'todos' },
        agrupamento: 'dia_semana',
      }),
      buildTestContext(),
    );

    expect(outcome).toMatchObject({ ok: true, dados: { ilustrativo: true } });
  });

  it('consultar_metricas recusa métrica fora do enum', async () => {
    const harness = createBudHarness();
    const outcome = await harness.executor.execute(
      call('consultar_metricas', {
        metrica: 'gols',
        periodo: { tipo: 'ultimos_dias', dias: 7 },
        categoria: ['sub_17'],
        atletas: { modo: 'todos' },
        agrupamento: 'dia_semana',
      }),
      buildTestContext(),
    );

    expect(outcome).toMatchObject({ ok: false, erro: 'metrica_fora_do_enum' });
  });

  it('criar_grafico abre um rascunho v1 com séries e coloca em foco', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);

    const draft = harness.store.getState().drafts[graphId];
    expect(draft).toMatchObject({ status: 'draft', versionLabels: ['barras'] });
    expect(draft.versions[0]).toMatchObject({ versao: 1, titulo: 'Check-ins por dia · Sub-17' });
    expect(draft.versions[0].series[0].pontos).toHaveLength(7);
    expect(harness.store.getThread(THREAD_KEY).focusGraphId).toBe(graphId);
  });

  it('criar_grafico respeita categorias_permitidas', async () => {
    const harness = createBudHarness();
    const outcome = await harness.executor.execute(
      call('criar_grafico', { spec: SPEC_INPUT }),
      buildTestContext({ allowedCategories: ['sub_15'] }),
    );

    expect(outcome).toMatchObject({ ok: false, erro: 'categoria_nao_permitida' });
    expect(harness.store.getState().drafts).toEqual({});
  });

  it('criar_grafico sem dado no período não cria rascunho', async () => {
    const harness = createBudHarness();
    const outcome = await harness.executor.execute(
      call('criar_grafico', {
        spec: {
          ...SPEC_INPUT,
          periodo: { tipo: 'intervalo', inicio: '2025-01-01', fim: '2025-01-10' },
        },
      }),
      buildTestContext(),
    );

    expect(outcome).toMatchObject({ ok: false, erro: 'sem_dados' });
  });

  it('ajustar_grafico cria nova versão e preserva a anterior', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);

    const outcome = await harness.executor.execute(
      call('ajustar_grafico', { id: graphId, patch: { categoria: ['sub_15', 'sub_17'] } }),
      buildTestContext(),
    );

    expect(outcome).toMatchObject({ ok: true, dados: { versao: 2 } });
    const draft = harness.store.getState().drafts[graphId];
    expect(draft.versionLabels).toEqual(['barras', 'comparação']);
    expect(draft.versions[0].categoria).toEqual(['sub_17']);
    expect(draft.versions[1].series).toHaveLength(2);
    expect(draft.activeIndex).toBe(1);
  });

  it('ajustar_grafico recusa um patch que deixa o spec inválido', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);
    await harness.executor.execute(
      call('ajustar_grafico', { id: graphId, patch: { categoria: ['sub_15', 'sub_17'] } }),
      buildTestContext(),
    );

    const outcome = await harness.executor.execute(
      call('ajustar_grafico', { id: graphId, patch: { tipo: 'donut' } }),
      buildTestContext(),
    );

    expect(outcome).toMatchObject({ ok: false, erro: 'spec_invalido' });
    expect(harness.store.getState().drafts[graphId].versions).toHaveLength(2);
  });

  it('salvar_grafico pede confirmação antes e só salva com confirmação pendente', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);

    const first = await harness.executor.execute(
      call('salvar_grafico', { id: graphId }),
      buildTestContext(),
    );
    expect(first).toMatchObject({ ok: true, dados: { status: 'aguardando_confirmacao' } });
    expect(harness.saved).toHaveLength(0);

    const confirmed = await harness.executor.execute(
      call('salvar_grafico', { id: graphId }),
      buildTestContext({ pendingConfirmation: { acao: 'salvar_grafico', grafico_id: graphId } }),
    );
    expect(confirmed).toMatchObject({ ok: true, dados: { status: 'salvo' } });
    expect(harness.saved).toHaveLength(1);
    expect(harness.store.getState().drafts[graphId]).toMatchObject({
      status: 'saved',
      dashboardChartId: 'dashboard-1',
    });
  });

  it('descartar_grafico tira o rascunho de foco', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);

    await harness.executor.execute(call('descartar_grafico', { id: graphId }), buildTestContext());

    expect(harness.store.getState().drafts[graphId].status).toBe('discarded');
    expect(harness.store.getThread(THREAD_KEY).focusGraphId).toBeNull();
    expect(harness.executor.getActiveSpec(graphId)).toBeNull();
  });

  it('abrir_no_builder devolve a rota do builder', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);

    expect(
      await harness.executor.execute(call('abrir_no_builder', { id: graphId }), buildTestContext()),
    ).toMatchObject({ ok: true, dados: { rota: `${ROUTES.chartBuilder}/${graphId}` } });
  });

  it('confirmar_por_voz só funciona no modo voz ao vivo', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);
    const args = { id: graphId, resposta: 'salvar' };

    expect(
      await harness.executor.execute(call('confirmar_por_voz', args), buildTestContext()),
    ).toMatchObject({ ok: false, erro: 'fora_do_modo_voz' });

    expect(
      await harness.executor.execute(
        call('confirmar_por_voz', args),
        buildTestContext({ mode: 'voz_ao_vivo', screen: 'voz_ao_vivo' }),
      ),
    ).toMatchObject({ ok: true, dados: { status: 'salvo' } });
    expect(harness.saved).toHaveLength(1);
  });

  it('edição manual de filtro atualiza a versão ativa sem criar outra', async () => {
    const harness = createBudHarness();
    const graphId = await createDraft(harness);

    await harness.executor.updateActiveVersion(graphId, { tipo: 'linha' }, buildTestContext());

    const draft = harness.store.getState().drafts[graphId];
    expect(draft.versions).toHaveLength(1);
    expect(draft.versions[0]).toMatchObject({ versao: 1, tipo: 'linha' });
  });
});
