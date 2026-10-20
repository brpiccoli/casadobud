import type { BudBrain } from './bud.engine.types';
import { buildTestContext, createBudHarness } from './bud.testUtils';

describe('runBudTurn com o cérebro local', () => {
  it('fluxo do Figma no chat: análise, barras por dia e comparação viram v1, v2 e v3', async () => {
    const harness = createBudHarness();

    const analysis = await harness.send('Como está o ritmo do time nesta semana?');
    expect(analysis.toolNames).toEqual(['consultar_metricas', 'criar_grafico']);
    expect(analysis.result.text).toContain('Montei uma visão resumida');
    expect(analysis.result.text).toContain('ilustrativos (placeholder)');
    const [graphId] = analysis.result.graphIds;

    const bars = await harness.send('Consegue deixar em barras por dia?');
    expect(bars.toolNames).toEqual(['ajustar_grafico', 'abrir_no_builder']);
    expect(bars.result.openBuilderGraphId).toBe(graphId);
    expect(bars.result.text).toBe(
      'Claro. Vou abrir a versão em barras nos Gráficos pra gente ajustar juntos.',
    );

    await harness.send('Compara o Sub-15 com o Sub-17?', buildTestContext({ screen: 'builder' }));

    const draft = harness.store.getState().drafts[graphId];
    expect(draft.versions.map((version) => version.versao)).toEqual([1, 2, 3]);
    expect(draft.versionLabels).toEqual(['linha', 'barras', 'comparação']);
    expect(draft.versions[0].tipo).toBe('linha');
  });

  it('o gráfico só muda através das tools (sequência consultar → criar → abrir no builder)', async () => {
    const harness = createBudHarness();
    const { events } = await harness.send(
      'Bud, cria um gráfico de check-ins por dia do Sub-17 na última semana',
    );

    const toolEvents = events.filter((event) => event.type === 'tool_result');
    expect(toolEvents.map((event) => event.type === 'tool_result' && event.call.nome)).toEqual([
      'consultar_metricas',
      'criar_grafico',
      'abrir_no_builder',
    ]);
    expect(events.at(-1)?.type).toBe('done');
  });

  it('roteamento: pedido de gráfico no chat abre o builder, análise continua no chat', async () => {
    const harness = createBudHarness();

    const chart = await harness.send('Crie um gráfico de check-ins');
    const [graphId] = chart.result.graphIds;
    expect(chart.result.openBuilderGraphId).toBe(graphId);
    expect(chart.result.text).toContain('Vou abrir nos Gráficos');

    const analysis = await createBudHarness().send('Como está o ritmo do time nesta semana?');
    expect(analysis.result.openBuilderGraphId).toBeNull();
    expect(analysis.result.graphIds).toHaveLength(1);

    const onBuilder = await createBudHarness().send(
      'Crie um gráfico de check-ins',
      buildTestContext({ screen: 'builder' }),
    );
    expect(onBuilder.toolNames).not.toContain('abrir_no_builder');
  });

  it('salvar pede confirmação e salva só depois do "sim"', async () => {
    const harness = createBudHarness();
    await harness.send('cria um gráfico de check-ins por dia do sub-17');

    const ask = await harness.send('salva isso');
    expect(ask.result.text).toMatch(/^Posso salvar ".+" no dashboard\?$/);
    expect(ask.result.pendingConfirmation).not.toBeNull();
    expect(harness.saved).toHaveLength(0);

    const confirm = await harness.send('sim');
    expect(confirm.result.savedGraphId).not.toBeNull();
    expect(harness.saved).toHaveLength(1);
  });

  it('uma confirmação que não veio logo em seguida expira', async () => {
    const harness = createBudHarness();
    await harness.send('cria um gráfico de check-ins por dia do sub-17');
    await harness.send('salva isso');
    await harness.send('vira linha');

    const late = await harness.send('sim');
    expect(late.toolNames).toEqual([]);
    expect(harness.saved).toHaveLength(0);
  });

  it('não salva duas vezes no mesmo turno sem o usuário confirmar', async () => {
    let graphId = '';
    const greedyBrain: BudBrain = {
      step: async ({ transcript }) => {
        if (transcript.at(-1)?.type !== 'user') return { text: '', toolCalls: [] };
        return {
          text: '',
          toolCalls: [
            { id: 'a', nome: 'salvar_grafico', argumentos: { id: graphId } },
            { id: 'b', nome: 'salvar_grafico', argumentos: { id: graphId } },
          ],
        };
      },
    };
    const harness = createBudHarness({ brain: greedyBrain });
    const created = await harness.executor.createGraph(
      {
        origem: 'chat',
        tipo: 'barras',
        metrica: 'check_ins',
        periodo: { tipo: 'ultimos_dias', dias: 7 },
        categoria: ['sub_17'],
        atletas: { modo: 'todos' },
        agrupamento: 'dia_semana',
      },
      buildTestContext(),
    );
    if (!created.ok || created.nome !== 'criar_grafico') throw new Error('falhou ao criar');
    graphId = created.dados.id;

    const { result } = await harness.send('salva');

    expect(harness.saved).toHaveLength(0);
    expect(result.pendingConfirmation?.grafico_id).toBe(graphId);
  });

  it('modo voz: confirmação usa confirmar_por_voz', async () => {
    const harness = createBudHarness();
    const voice = buildTestContext({ screen: 'voz_ao_vivo', mode: 'voz_ao_vivo' });
    const created = await harness.send('cria um gráfico de check-ins por dia do sub-17', voice);
    const [graphId] = created.result.graphIds;
    harness.store.updateThread('thread-test', {
      pendingConfirmation: { acao: 'salvar_grafico', grafico_id: graphId },
    });

    const adjust = await harness.send('Quase, quero ajustar', voice);
    expect(adjust.toolNames).toEqual(['confirmar_por_voz']);
    expect(adjust.result.voiceAnswer).toBe('ajustando');

    harness.store.updateThread('thread-test', {
      pendingConfirmation: { acao: 'salvar_grafico', grafico_id: graphId },
    });
    const save = await harness.send('Sim, salva no dashboard', voice);
    expect(save.result.voiceAnswer).toBe('salvo');
    expect(harness.saved).toHaveLength(1);
  });

  it.each([
    ['faz um gráfico de lesões', 'Ainda não acompanho "lesões"'],
    ['manda no WhatsApp', 'Ainda não consigo mandar nada para fora'],
    ['como ele está?', 'De quem você está falando?'],
    ['ele tem depressão?', 'diagnóstico é com você'],
  ])('limite: "%s" responde só com texto', async (message, expected) => {
    const harness = createBudHarness();
    const { result, toolNames } = await harness.send(message);

    expect(toolNames).toEqual([]);
    expect(result.text).toContain(expected);
  });

  it('sem dado no período, diz que não há e não inventa número', async () => {
    const harness = createBudHarness();
    const { result } = await harness.send('cria um gráfico de check-ins de 01/01 a 10/01');

    expect(result.graphIds).toEqual([]);
    expect(result.text).toContain('Não encontrei dados');
    expect(result.text).not.toMatch(/\d+ check-ins/);
  });

  it('remove travessão e hífen usados como separador de frase', async () => {
    const dashBrain: BudBrain = {
      step: async () => ({
        text: 'Pronto — salvei. Quinta - o dia mais forte – foi ótima.',
        toolCalls: [],
      }),
    };
    const harness = createBudHarness({ brain: dashBrain });

    const { result } = await harness.send('oi');
    expect(result.text).toBe('Pronto, salvei. Quinta, o dia mais forte, foi ótima.');
  });
});
