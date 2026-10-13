import { PLACEHOLDER_ALLOWED_CATEGORIES } from './bud.constants';
import { parseBudIntent } from './bud.intent';
import { buildAthleteRosterMock } from './bud.mocks';
import { BUD_FEW_SHOTS } from './bud.prompt';
import { REFERENCE_DATE, buildTestContext, buildTestSpec } from './bud.testUtils';
import { validateGraphSpec } from './graphSpec.utils';

const roster = buildAthleteRosterMock();
const withFocus = buildTestContext({ focus: buildTestSpec({ categoria: ['elenco_todo'] }) });
const withoutFocus = buildTestContext();

function parse(message: string, context = withFocus) {
  return parseBudIntent(message, context, roster, REFERENCE_DATE);
}

describe('de-para linguagem natural → parâmetro (few-shots do prompt)', () => {
  it.each(BUD_FEW_SHOTS)('"$fala"', ({ fala, esperado }) => {
    const intent = parse(fala);

    if ('ferramenta' in esperado) {
      const kindByTool = { salvar_grafico: 'save', descartar_grafico: 'discard' } as const;
      expect(intent.kind).toBe(kindByTool[esperado.ferramenta as keyof typeof kindByTool]);
      return;
    }

    expect(intent).toEqual({ kind: 'adjust', patch: esperado.patch });
  });
});

describe('criação de gráfico a partir de linguagem natural', () => {
  it('"em barras por dia do Sub-17" vira um GraphSpec válido', () => {
    const intent = parse('em barras por dia do Sub-17', withoutFocus);

    expect(intent.kind).toBe('create');
    if (intent.kind !== 'create') return;
    expect(intent.spec).toMatchObject({
      tipo: 'barras',
      agrupamento: 'dia_semana',
      categoria: ['sub_17'],
      metrica: 'check_ins',
      periodo: { tipo: 'ultimos_dias', dias: 7 },
      atletas: { modo: 'todos' },
    });

    const validation = validateGraphSpec(
      { ...intent.spec, id: 'novo', versao: 1, titulo: 'novo', series: [] },
      PLACEHOLDER_ALLOWED_CATEGORIES,
    );
    expect(validation.ok).toBe(true);
  });

  it('pedido falado da voz ao vivo', () => {
    const intent = parse(
      'Bud, cria um gráfico de check-ins por dia do Sub-17 na última semana',
      withoutFocus,
    );

    expect(intent).toMatchObject({
      kind: 'create',
      style: 'chart',
      spec: {
        metrica: 'check_ins',
        tipo: 'barras',
        categoria: ['sub_17'],
        agrupamento: 'dia_semana',
      },
    });
  });

  it('pergunta de análise com métrica vira visão resumida em linha', () => {
    expect(parse('Como está o ritmo do time nesta semana?', withoutFocus)).toMatchObject({
      kind: 'create',
      style: 'analysis',
      spec: { metrica: 'ritmo', tipo: 'linha' },
    });
  });

  it('com gráfico em foco, "novo gráfico" cria outro em vez de ajustar', () => {
    expect(parse('cria um gráfico de sono por atleta')).toMatchObject({ kind: 'create' });
  });

  it('compara com a categoria do gráfico em foco', () => {
    const context = buildTestContext({ focus: buildTestSpec({ categoria: ['sub_17'] }) });

    expect(parse('compara com o sub-15', context)).toEqual({
      kind: 'adjust',
      patch: { categoria: ['sub_15', 'sub_17'] },
    });
  });

  it('pedido de gráfico sem métrica pergunta qual métrica', () => {
    expect(parse('cria um gráfico pra mim', withoutFocus)).toEqual({ kind: 'missing_metric' });
  });
});

describe('limites', () => {
  it('métrica fora do enum é recusada', () => {
    expect(parse('faz um gráfico de lesões', withoutFocus)).toEqual({
      kind: 'unknown_metric',
      term: 'lesões',
    });
  });

  it('ação fora das ferramentas é explicada', () => {
    expect(parse('manda no WhatsApp do grupo')).toEqual({ kind: 'out_of_scope_action' });
    expect(parse('exporta em PDF')).toEqual({ kind: 'out_of_scope_action' });
  });

  it('referência ambígua pede desambiguação', () => {
    expect(parse('e aquele atleta, como está?')).toEqual({ kind: 'ambiguous_reference' });
  });

  it('primeiro nome repetido no elenco pede desambiguação', () => {
    const repeated = roster.filter((athlete) => athlete.nome.startsWith('Gustavo '));
    expect(repeated.length).toBeGreaterThan(1);

    expect(parse('só o Gustavo')).toMatchObject({ kind: 'ambiguous_athlete', name: 'Gustavo' });
  });

  it('não faz diagnóstico clínico', () => {
    expect(parse('ele tem depressão?')).toEqual({ kind: 'clinical' });
  });

  it('respeita categorias_permitidas', () => {
    const context = buildTestContext({ allowedCategories: ['sub_17'] });

    expect(parse('check-ins do sub-15', context)).toEqual({
      kind: 'forbidden_category',
      category: 'sub_15',
    });
  });
});

describe('confirmação', () => {
  const pending = buildTestContext({
    focus: buildTestSpec(),
    pendingConfirmation: { acao: 'salvar_grafico', grafico_id: 'grafico-teste' },
  });

  it('entende sim e não quando há confirmação pendente', () => {
    expect(parse('sim', pending)).toEqual({ kind: 'confirm_yes' });
    expect(parse('Sim, salva no dashboard', pending)).toEqual({ kind: 'confirm_yes' });
    expect(parse('Quase, quero ajustar', pending)).toEqual({ kind: 'confirm_no' });
  });

  it('sem confirmação pendente, "sim" não salva nada', () => {
    expect(parse('sim')).toEqual({ kind: 'help' });
  });
});
