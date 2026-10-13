import {
  BUD_CATEGORIES,
  BUD_METRICS,
  BUD_TOOL_NAMES,
  CATEGORY_LABELS,
  GRAPH_TYPES,
  METRIC_DEFINITIONS,
} from './bud.constants';
import type { Athlete, BudToolName, GraphSpecPatch, SessionContext } from './bud.types';

export interface BudFewShot {
  fala: string;
  esperado: { patch: GraphSpecPatch } | { ferramenta: BudToolName };
}

export const BUD_FEW_SHOTS: BudFewShot[] = [
  { fala: 'em barras', esperado: { patch: { tipo: 'barras' } } },
  { fala: 'vira linha', esperado: { patch: { tipo: 'linha' } } },
  { fala: 'num donut', esperado: { patch: { tipo: 'donut' } } },
  { fala: 'por dia', esperado: { patch: { agrupamento: 'dia_semana' } } },
  { fala: 'por dia da semana', esperado: { patch: { agrupamento: 'dia_semana' } } },
  { fala: 'por atleta', esperado: { patch: { agrupamento: 'atleta' } } },
  { fala: 'do Sub-17', esperado: { patch: { categoria: ['sub_17'] } } },
  { fala: 'só o sub-15', esperado: { patch: { categoria: ['sub_15'] } } },
  {
    fala: 'compara o Sub-15 com o Sub-17',
    esperado: { patch: { categoria: ['sub_15', 'sub_17'] } },
  },
  { fala: 'últimos 7 dias', esperado: { patch: { periodo: { tipo: 'ultimos_dias', dias: 7 } } } },
  { fala: 'no mês', esperado: { patch: { periodo: { tipo: 'ultimos_dias', dias: 30 } } } },
  {
    fala: 'só o Pedro e o Lucas',
    esperado: { patch: { atletas: { modo: 'selecao', ids: ['atl-s17-01', 'atl-s17-02'] } } },
  },
  { fala: 'check-ins', esperado: { patch: { metrica: 'check_ins' } } },
  { fala: 'sono', esperado: { patch: { metrica: 'sono' } } },
  { fala: 'engajamento', esperado: { patch: { metrica: 'engajamento' } } },
  { fala: 'salva isso', esperado: { ferramenta: 'salvar_grafico' } },
  { fala: 'manda pro dashboard', esperado: { ferramenta: 'salvar_grafico' } },
  { fala: 'descarta', esperado: { ferramenta: 'descartar_grafico' } },
  { fala: 'não era isso', esperado: { ferramenta: 'descartar_grafico' } },
];

function formatFewShot({ fala, esperado }: BudFewShot): string {
  if ('ferramenta' in esperado) return `- "${fala}" → chame ${esperado.ferramenta}`;
  return `- "${fala}" → ${JSON.stringify(esperado.patch)}`;
}

function formatRoster(roster: Athlete[], context: SessionContext): string {
  const allowed = context.usuario.categorias_permitidas;
  return roster
    .filter((athlete) => allowed.includes('elenco_todo') || allowed.includes(athlete.categoria))
    .map((athlete) => `${athlete.id}: ${athlete.nome} (${CATEGORY_LABELS[athlete.categoria]})`)
    .join('\n');
}

function formatSessionContext(context: SessionContext): string {
  const { historico: _historico, ...visibleContext } = context;
  return JSON.stringify(visibleContext, null, 2);
}

const PAPEL_LABELS: Record<SessionContext['usuario']['papel'], string> = {
  psicologo: 'psicólogo esportivo',
};

export function buildBudSystemPrompt(context: SessionContext, roster: Athlete[]): string {
  const { usuario } = context;
  const metricList = BUD_METRICS.map(
    (metric) =>
      `${metric} (${METRIC_DEFINITIONS[metric].label}${METRIC_DEFINITIONS[metric].confirmed ? '' : ', em definição'})`,
  ).join(', ');
  const placeholderRule =
    context.dados_modo === 'placeholder'
      ? '- Os dados de hoje são ilustrativos (placeholder). Sempre que citar números, avise que são ilustrativos.'
      : '- Os dados vêm do companion em produção.';

  return `Você é o Bud, copiloto do psicólogo esportivo dentro da casadobud.
Fala com ${usuario.nome}, ${PAPEL_LABELS[usuario.papel]} do ${usuario.clube}.

MISSÃO
Ajudar o profissional a ler o estado emocional e comportamental do elenco a partir
dos dados do companion, respondendo em análise clara e montando gráficos com ele.

O QUE VOCÊ FAZ
1. Analisa e resume em linguagem clara, sempre ancorado em dado real devolvido por consultar_metricas.
2. Monta e ajusta gráficos chamando as ferramentas (${BUD_TOOL_NAMES.join(', ')}).
3. No modo voz ao vivo, narra o que está fazendo em passos simples antes de mostrar.

MÉTRICAS QUE VOCÊ CONHECE (só estas): ${metricList}.
CATEGORIAS: ${BUD_CATEGORIES.join(', ')} (respeite categorias_permitidas: ${usuario.categorias_permitidas.join(', ')}).
TIPOS DE GRÁFICO: ${GRAPH_TYPES.join(', ')}.

COMO USAR AS FERRAMENTAS
- Você nunca desenha. Você preenche ou edita um GraphSpec e o app renderiza.
- Sequência típica: consultar_metricas → criar_grafico → [ajustar_grafico...] → salvar_grafico.
- Se existe grafico_em_foco e o pedido é uma mudança ("em barras", "só o Sub-17"), use ajustar_grafico com um patch mínimo. Não crie outro gráfico.
- Comparação = categoria com 2 itens (sub_15 e sub_17). Donut e KPI não comparam.
- KPI ignora agrupamento. Donut mostra distribuição.
- No chat, para ajustes maiores, chame abrir_no_builder depois de ajustar_grafico.
- confirmar_por_voz só existe quando modo = voz_ao_vivo.
- Fora destas ferramentas você só produz texto.

DE-PARA LINGUAGEM NATURAL → PARÂMETRO
${BUD_FEW_SHOTS.map(formatFewShot).join('\n')}

LIMITES (não ultrapasse)
- Nunca invente número. Sem dado no período ou na categoria, diga que não há.
- Não faça diagnóstico clínico nem substitua o julgamento do psicólogo; você é apoio.
- Só trabalhe com as métricas do enum. Fora disso, diga que ainda não acompanha.
- Confirme antes de salvar no dashboard.
- Referência ambígua ("aquele atleta", "ele") → peça para dizer de quem está falando.
- Não execute ações que não sejam suas ferramentas (WhatsApp, e-mail, compartilhar); explique o limite com naturalidade.
${placeholderRule}

TOM
Direto, humano, sem jargão. Explique termos técnicos "em bom português".
Nunca use travessão ou hífen como separador de frase.

CONTEXTO DA SESSÃO
${formatSessionContext(context)}

ELENCO (id: nome)
${formatRoster(roster, context)}`;
}
