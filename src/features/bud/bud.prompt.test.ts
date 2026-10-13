import { BUD_METRICS, BUD_TOOL_NAMES } from './bud.constants';
import { sanitizeBudCopy } from './bud.guardrails';
import { buildAthleteRosterMock } from './bud.mocks';
import { buildBudSystemPrompt } from './bud.prompt';
import { buildTestContext } from './bud.testUtils';
import { BUD_TOOL_DEFINITIONS } from './bud.tools.schema';

const roster = buildAthleteRosterMock();

describe('buildBudSystemPrompt', () => {
  const prompt = buildBudSystemPrompt(buildTestContext(), roster);

  it('apresenta o Bud para o usuário da sessão', () => {
    expect(prompt).toContain('Fala com Bruno Perna, psicólogo esportivo do Juventus Mooca.');
  });

  it('lista o enum fechado de métricas e as 7 tools', () => {
    BUD_METRICS.forEach((metric) => expect(prompt).toContain(metric));
    BUD_TOOL_NAMES.forEach((tool) => expect(prompt).toContain(tool));
  });

  it('traz os limites e o aviso de dado ilustrativo', () => {
    expect(prompt).toContain('Nunca invente número.');
    expect(prompt).toContain('Não faça diagnóstico clínico');
    expect(prompt).toContain('Confirme antes de salvar no dashboard.');
    expect(prompt).toContain('ilustrativos (placeholder)');
  });

  it('inclui o de-para como few-shot', () => {
    expect(prompt).toContain('- "em barras" → {"tipo":"barras"}');
    expect(prompt).toContain('- "salva isso" → chame salvar_grafico');
  });

  it('só expõe atletas das categorias permitidas', () => {
    const restricted = buildBudSystemPrompt(
      buildTestContext({ allowedCategories: ['sub_17'] }),
      roster,
    );

    expect(restricted).toContain('atl-s17-01: Pedro Martins (Sub-17)');
    expect(restricted).not.toContain('(Sub-15)\n');
    expect(restricted).not.toMatch(/atl-s15-\d+:/);
  });

  it('não usa travessão como separador no próprio prompt', () => {
    expect(prompt).not.toMatch(/[—–]/);
  });
});

describe('BUD_TOOL_DEFINITIONS', () => {
  it('declara exatamente as 7 tools do contrato', () => {
    expect(BUD_TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual([...BUD_TOOL_NAMES]);
  });

  it('fecha o enum de métricas no schema', () => {
    const consult = BUD_TOOL_DEFINITIONS.find((tool) => tool.name === 'consultar_metricas');

    expect(consult?.parameters.properties?.metrica.enum).toEqual(BUD_METRICS);
  });
});

describe('sanitizeBudCopy', () => {
  it('troca separadores por vírgula e preserva hífen dentro de palavras', () => {
    expect(sanitizeBudCopy('Check-ins do Sub-17 — quinta foi forte')).toBe(
      'Check-ins do Sub-17, quinta foi forte',
    );
    expect(sanitizeBudCopy('Ficou estável - sem surpresas.')).toBe('Ficou estável, sem surpresas.');
  });
});
