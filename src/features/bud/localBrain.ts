import {
  CATEGORY_LABELS,
  GRAPH_TYPE_SHORT_LABELS,
  METRIC_DEFINITIONS,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_LABELS,
} from './bud.constants';
import type { BudBrain, BudBrainStep, BudTranscriptItem } from './bud.engine.types';
import { describeAllowedCategories, parseBudIntent, type BudIntent } from './bud.intent';
import type {
  Athlete,
  BudCategory,
  BudMetric,
  BudToolArgsMap,
  BudToolCall,
  BudToolName,
  BudToolOutcome,
  GraphSpec,
  GraphSpecPatch,
  Serie,
  SessionContext,
} from './bud.types';
import {
  findPeakIndex,
  formatMetricPoint,
  formatMetricSummary,
  formatPeriod,
  isComparison,
} from './graphSpec.utils';

export interface LocalBudBrainOptions {
  roster: Athlete[];
  referenceDate?: () => Date;
}

interface ToolExchange {
  call: BudToolCall;
  outcome: BudToolOutcome;
}

const PLACEHOLDER_NOTICE =
  'Os valores são ilustrativos (placeholder), só pra gente alinhar o formato.';
const NO_FOCUS_REPLY =
  'Ainda não tem nenhum gráfico aberto. Quer que eu monte um? Me diz a métrica, por exemplo "check-ins por dia do Sub-17".';

const METRIC_SUBJECT: Record<BudMetric, { text: string; plural: boolean }> = {
  check_ins: { text: 'os check-ins', plural: true },
  sono: { text: 'o sono', plural: false },
  humor: { text: 'o humor', plural: false },
  engajamento: { text: 'o engajamento', plural: false },
  ritmo: { text: 'o ritmo', plural: false },
};

const GROUPING_PHRASE: Record<GraphSpec['agrupamento'], string> = {
  dia_semana: 'dia a dia',
  data: 'data a data',
  atleta: 'atleta por atleta',
  grupo: 'por grupo',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

function categoryPhrase(categories: BudCategory[]): string {
  if (categories.includes('elenco_todo')) return 'do elenco todo';
  return joinNames(categories.map((category) => `do ${CATEGORY_LABELS[category]}`));
}

function periodPhrase(spec: Pick<GraphSpec, 'periodo'>): string {
  if (spec.periodo.tipo === 'ultimos_dias') return `nos últimos ${spec.periodo.dias} dias`;
  return `de ${formatPeriod(spec.periodo)}`;
}

function weekdayPhrase(label: string): string {
  const index = WEEKDAY_LABELS.indexOf(label as (typeof WEEKDAY_LABELS)[number]);
  if (index === -1) return label;
  return WEEKDAY_FULL_LABELS[index];
}

function weekdayWithPreposition(label: string): string {
  const index = WEEKDAY_LABELS.indexOf(label as (typeof WEEKDAY_LABELS)[number]);
  const preposition = index >= 5 ? 'no' : 'na';
  return `${preposition} ${weekdayPhrase(label)}`;
}

function placeholderNotice(context: SessionContext): string {
  return context.dados_modo === 'placeholder' ? ` ${PLACEHOLDER_NOTICE}` : '';
}

function noDataReply(spec: Pick<GraphSpec, 'metrica' | 'periodo' | 'categoria'>): string {
  return `Não encontrei dados de ${METRIC_DEFINITIONS[spec.metrica].label.toLowerCase()} ${periodPhrase(spec)} ${categoryPhrase(spec.categoria)}. Não vou chutar número; quer tentar outro período ou categoria?`;
}

export function describeInsight(spec: GraphSpec): string {
  const [primary, secondary] = spec.series;
  if (!primary || primary.pontos.length === 0) return '';

  if (spec.tipo === 'kpi' || spec.tipo === 'donut') {
    return `${capitalize(periodPhrase(spec))}, ficou em ${formatMetricSummary(spec.metrica, primary.resumo.valor)}.`;
  }

  if (secondary && isComparison(spec)) {
    const ahead = primary.pontos.filter(
      (point, index) => point.valor > (secondary.pontos[index]?.valor ?? 0),
    ).length;
    return `O ${primary.rotulo} ficou acima do ${secondary.rotulo} em ${ahead} de ${primary.pontos.length} pontos.`;
  }

  const peak = primary.pontos[findPeakIndex(primary) ?? 0];
  const value = formatMetricPoint(spec.metrica, peak.valor);

  switch (spec.agrupamento) {
    case 'dia_semana':
      return `${capitalize(weekdayPhrase(peak.rotulo))} foi o dia mais forte, com ${value}.`;
    case 'data':
      return `O pico foi em ${peak.rotulo}, com ${value}.`;
    case 'atleta':
      return `${peak.rotulo} aparece no topo, com ${value}.`;
    case 'grupo':
      return `O ${peak.rotulo} ficou na frente, com ${value}.`;
  }
}

function describeTrend(spec: GraphSpec): string {
  const [primary] = spec.series;
  const subject = METRIC_SUBJECT[spec.metrica];
  const peak = primary.pontos[findPeakIndex(primary) ?? 0];
  const peakText =
    spec.agrupamento === 'dia_semana' && peak
      ? `, com pico ${weekdayWithPreposition(peak.rotulo)}`
      : '';
  const subjectText = `${capitalize(subject.text)} do time`;

  if (primary.resumo.variacao >= 1) {
    return `${subjectText} ${subject.plural ? 'subiram' : 'subiu'} ao longo do período${peakText}.`;
  }
  if (primary.resumo.variacao <= -1) {
    return `${subjectText} ${subject.plural ? 'caíram' : 'caiu'} ao longo do período${peakText}.`;
  }
  return `${subjectText} ${subject.plural ? 'se mantiveram estáveis' : 'se manteve estável'}${peakText}.`;
}

function describeCreatedGraph(
  spec: GraphSpec,
  style: 'chart' | 'analysis',
  context: SessionContext,
): string {
  if (style === 'analysis') {
    return `${describeTrend(spec)}\n\nMontei uma visão resumida com os dados do companion.${placeholderNotice(context)}`;
  }

  const subject = METRIC_SUBJECT[spec.metrica].text;
  const target = categoryPhrase(spec.categoria);
  const intro =
    spec.tipo === 'kpi'
      ? `Montei um indicador com ${subject} ${target}.`
      : `Montei o gráfico de ${GRAPH_TYPE_SHORT_LABELS[spec.tipo]} com ${subject} ${target}, ${GROUPING_PHRASE[spec.agrupamento]}.`;
  return `${intro} ${describeInsight(spec)}${placeholderNotice(context)}`.trim();
}

function describePatch(
  patch: GraphSpecPatch,
  previous: GraphSpec | null,
  roster: Athlete[],
): string[] {
  const sentences: string[] = [];

  if (patch.categoria && patch.categoria.length > 1) {
    sentences.push(
      'Liguei a comparação entre os dois grupos. Cada ponto mostra as duas categorias lado a lado.',
    );
  } else if (patch.categoria) {
    sentences.push(
      `Agora o gráfico mostra só ${categoryPhrase(patch.categoria).replace(/^do /, 'o ')}.`,
    );
  }

  if (patch.tipo) {
    const origin = previous
      ? ` a partir do gráfico de ${METRIC_DEFINITIONS[previous.metrica].label.toLowerCase()}`
      : '';
    sentences.push(`Criei a versão em ${GRAPH_TYPE_SHORT_LABELS[patch.tipo]}${origin}.`);
  }
  if (patch.metrica) {
    sentences.push(
      `Troquei a métrica para ${METRIC_DEFINITIONS[patch.metrica].label.toLowerCase()}.`,
    );
  }
  if (patch.periodo) {
    sentences.push(
      `Mudei o período para ${periodPhrase({ periodo: patch.periodo }).replace(/^nos /, 'os ')}.`,
    );
  }
  if (patch.atletas?.modo === 'selecao') {
    const selectedIds = patch.atletas.ids;
    const names = roster
      .filter((athlete) => selectedIds.includes(athlete.id))
      .map((athlete) => athlete.nome);
    sentences.push(`Filtrei para ${joinNames(names)}.`);
  } else if (patch.atletas) {
    sentences.push('Voltei para todos os atletas.');
  }
  if (patch.agrupamento) {
    sentences.push(`Agora está separado ${GROUPING_PHRASE[patch.agrupamento]}.`);
  }
  if (patch.titulo) {
    sentences.push(`Renomeei para "${patch.titulo}".`);
  }

  return sentences;
}

function findOutcome<Name extends BudToolName>(
  exchanges: ToolExchange[],
  name: Name,
): Extract<BudToolOutcome, { nome: Name }> | undefined {
  return exchanges.find((exchange) => exchange.outcome.nome === name)?.outcome as
    Extract<BudToolOutcome, { nome: Name }> | undefined;
}

function firstError(exchanges: ToolExchange[]): BudToolOutcome | undefined {
  return exchanges.find((exchange) => !exchange.outcome.ok)?.outcome;
}

function seriesFrom(exchanges: ToolExchange[], metrica: BudMetric): Serie[] {
  const exchange = exchanges.find(
    (item) =>
      item.call.nome === 'consultar_metricas' &&
      item.call.argumentos.metrica === metrica &&
      item.outcome.ok,
  );
  if (!exchange?.outcome.ok || exchange.outcome.nome !== 'consultar_metricas') return [];
  return exchange.outcome.dados.series;
}

export function createLocalBudBrain({
  roster,
  referenceDate = () => new Date(),
}: LocalBudBrainOptions): BudBrain {
  const plans = new Map<string, { intent: BudIntent; previousFocus: GraphSpec | null }>();
  let callCounter = 0;

  const call = <Name extends BudToolName>(
    nome: Name,
    argumentos: BudToolArgsMap[Name],
  ): BudToolCall => {
    callCounter += 1;
    return { id: `call-${callCounter}`, nome, argumentos } as BudToolCall;
  };

  const reply = (text: string): BudBrainStep => ({ text, toolCalls: [] });

  const plan = (intent: BudIntent, context: SessionContext): BudBrainStep => {
    const focus = context.grafico_em_foco;
    const isVoice = context.modo === 'voz_ao_vivo';
    const pendingId = context.confirmacao_pendente?.grafico_id;

    switch (intent.kind) {
      case 'confirm_yes':
        if (!pendingId) return reply(NO_FOCUS_REPLY);
        return {
          text: '',
          toolCalls: [
            isVoice
              ? call('confirmar_por_voz', { id: pendingId, resposta: 'salvar' })
              : call('salvar_grafico', { id: pendingId }),
          ],
        };
      case 'confirm_no':
        if (isVoice && pendingId) {
          return {
            text: '',
            toolCalls: [call('confirmar_por_voz', { id: pendingId, resposta: 'ajustar' })],
          };
        }
        return reply('Tudo bem, não salvei. O que você quer mudar?');
      case 'save':
        if (!focus) return reply(NO_FOCUS_REPLY);
        return { text: '', toolCalls: [call('salvar_grafico', { id: focus.id })] };
      case 'discard':
        if (!focus) return reply(NO_FOCUS_REPLY);
        return { text: '', toolCalls: [call('descartar_grafico', { id: focus.id })] };
      case 'open_builder':
        if (!focus) return reply(NO_FOCUS_REPLY);
        return { text: '', toolCalls: [call('abrir_no_builder', { id: focus.id })] };
      case 'clinical':
        return reply(
          'Isso eu não faço: diagnóstico é com você, que é o profissional. Posso te mostrar os dados do companion que ajudam nessa leitura, como humor, sono e check-ins.',
        );
      case 'out_of_scope_action':
        return reply(
          'Ainda não consigo mandar nada para fora da casadobud, como WhatsApp, e-mail ou compartilhamento. Por aqui eu consulto os dados, monto gráficos e salvo no seu dashboard.',
        );
      case 'unknown_metric':
        return reply(
          `Ainda não acompanho ${intent.term ? `"${intent.term}"` : 'isso'}. Hoje eu consigo olhar check-ins, sono, humor, engajamento e ritmo.`,
        );
      case 'missing_metric':
        return reply(
          'Consigo sim. Qual métrica você quer ver: check-ins, sono, humor, engajamento ou ritmo?',
        );
      case 'forbidden_category':
        return reply(
          `Você não tem acesso aos dados do ${CATEGORY_LABELS[intent.category]}. Posso olhar: ${describeAllowedCategories(context)}.`,
        );
      case 'ambiguous_reference':
        return reply('De quem você está falando? Me diz o nome do atleta que eu busco.');
      case 'ambiguous_athlete':
        return reply(
          `Achei mais de um ${intent.name}: ${joinNames(intent.matches.map((athlete) => athlete.nome))}. Qual deles?`,
        );
      case 'adjust': {
        if (!focus) return reply(NO_FOCUS_REPLY);
        const calls = [call('ajustar_grafico', { id: focus.id, patch: intent.patch })];
        if (context.tela_atual === 'chat') calls.push(call('abrir_no_builder', { id: focus.id }));
        return { text: '', toolCalls: calls };
      }
      case 'create': {
        const { metrica, periodo, categoria, atletas, agrupamento } = intent.spec;
        return {
          text: '',
          toolCalls: [
            call('consultar_metricas', { metrica, periodo, categoria, atletas, agrupamento }),
            call('criar_grafico', { spec: intent.spec }),
          ],
        };
      }
      case 'changes_since_yesterday':
        return {
          text: '',
          toolCalls: [
            call('consultar_metricas', {
              metrica: 'check_ins',
              periodo: { tipo: 'ultimos_dias', dias: 7 },
              categoria: ['elenco_todo'],
              atletas: { modo: 'todos' },
              agrupamento: 'data',
            }),
          ],
        };
      case 'team_overview':
        return {
          text: '',
          toolCalls: (['check_ins', 'humor'] as const).map((metrica) =>
            call('consultar_metricas', {
              metrica,
              periodo: { tipo: 'ultimos_dias', dias: 7 },
              categoria: ['elenco_todo'],
              atletas: { modo: 'todos' },
              agrupamento: 'dia_semana',
            }),
          ),
        };
      case 'help':
        return reply(
          'Posso analisar check-ins, sono, humor, engajamento e ritmo do elenco, ou montar um gráfico com eles. Por exemplo: "cria um gráfico de check-ins por dia do Sub-17".',
        );
    }
  };

  const compose = (
    intent: BudIntent,
    context: SessionContext,
    previousFocus: GraphSpec | null,
    exchanges: ToolExchange[],
  ): string => {
    const error = firstError(exchanges);

    switch (intent.kind) {
      case 'create': {
        if (error?.ok === false) {
          return error.erro === 'sem_dados' ? noDataReply(intent.spec) : error.mensagem;
        }
        const spec = context.grafico_em_foco;
        return spec ? describeCreatedGraph(spec, intent.style, context) : '';
      }
      case 'adjust': {
        if (error?.ok === false) {
          if (error.erro === 'sem_dados' && previousFocus) {
            return noDataReply({ ...previousFocus, ...intent.patch });
          }
          return error.mensagem;
        }
        const spec = context.grafico_em_foco;
        if (findOutcome(exchanges, 'abrir_no_builder')?.ok) {
          const target = intent.patch.tipo
            ? `a versão em ${GRAPH_TYPE_SHORT_LABELS[intent.patch.tipo]}`
            : 'essa versão';
          return `Claro. Vou abrir ${target} nos Gráficos pra gente ajustar juntos.`;
        }
        const sentences = describePatch(intent.patch, previousFocus, roster);
        const insight = spec && !intent.patch.categoria ? ` ${describeInsight(spec)}` : '';
        return `${sentences.join(' ')}${insight} Quer ajustar o período ou a categoria?`.trim();
      }
      case 'save':
      case 'confirm_yes': {
        if (error?.ok === false) return error.mensagem;
        const saved =
          findOutcome(exchanges, 'salvar_grafico') ?? findOutcome(exchanges, 'confirmar_por_voz');
        const title = context.grafico_em_foco?.titulo ?? previousFocus?.titulo ?? 'o gráfico';
        if (saved?.ok && saved.dados.status === 'aguardando_confirmacao') {
          return `Posso salvar "${title}" no dashboard?`;
        }
        return `Pronto, salvei "${title}" no dashboard.`;
      }
      case 'confirm_no':
        return error?.ok === false ? error.mensagem : 'Beleza. O que você quer mudar?';
      case 'discard':
        return error?.ok === false
          ? error.mensagem
          : 'Descartei o rascunho. Se quiser, a gente monta outro.';
      case 'open_builder':
        return error?.ok === false ? error.mensagem : 'Abrindo nos Gráficos.';
      case 'changes_since_yesterday': {
        if (error?.ok === false) return error.mensagem;
        const [serie] = seriesFrom(exchanges, 'check_ins');
        const points = serie?.pontos ?? [];
        if (points.length < 2)
          return noDataReply({
            metrica: 'check_ins',
            periodo: { tipo: 'ultimos_dias', dias: 7 },
            categoria: ['elenco_todo'],
          });
        const [yesterday, today] = points.slice(-2);
        const difference = today.valor - yesterday.valor;
        const change =
          difference === 0
            ? 'Ficou igual.'
            : `${difference > 0 ? 'Subiu' : 'Caiu'} ${Math.abs(difference)}.`;
        return `De ${yesterday.rotulo} para ${today.rotulo}, os check-ins do elenco foram de ${yesterday.valor} para ${today.valor}. ${change}${placeholderNotice(context)}`;
      }
      case 'team_overview': {
        if (error?.ok === false) return error.mensagem;
        const [checkIns] = seriesFrom(exchanges, 'check_ins');
        const [mood] = seriesFrom(exchanges, 'humor');
        if (!checkIns?.pontos.length) {
          return noDataReply({
            metrica: 'check_ins',
            periodo: { tipo: 'ultimos_dias', dias: 7 },
            categoria: ['elenco_todo'],
          });
        }
        const peak = checkIns.pontos[findPeakIndex(checkIns) ?? 0];
        const moodText = mood?.pontos.length
          ? ` e o humor médio em ${formatMetricSummary('humor', mood.resumo.valor)}`
          : '';
        return `Nos últimos 7 dias, a taxa de check-in do elenco ficou em ${formatMetricSummary('check_ins', checkIns.resumo.valor)}${moodText}. ${capitalize(weekdayPhrase(peak.rotulo))} foi o dia com mais check-ins.${placeholderNotice(context)} Quer que eu monte um gráfico com isso?`;
      }
      default:
        return '';
    }
  };

  return {
    step: async ({ context, transcript }) => {
      const lastUserIndex = transcript.findLastIndex((item) => item.type === 'user');
      const userItem = transcript[lastUserIndex] as
        Extract<BudTranscriptItem, { type: 'user' }> | undefined;
      if (!userItem) return reply('');

      const turnItems = transcript.slice(lastUserIndex + 1);
      const firstCall = turnItems.find((item) => item.type === 'tool_call');

      if (!firstCall) {
        if (turnItems.some((item) => item.type === 'bud')) return reply('');
        const intent = parseBudIntent(userItem.text, context, roster, referenceDate());
        const step = plan(intent, context);
        if (step.toolCalls[0]) {
          plans.set(step.toolCalls[0].id, { intent, previousFocus: context.grafico_em_foco });
        }
        return step;
      }

      if (turnItems.some((item) => item.type === 'bud')) return reply('');

      const planned = plans.get(firstCall.call.id);
      plans.delete(firstCall.call.id);
      if (!planned) return reply('');

      const exchanges: ToolExchange[] = turnItems.flatMap((item) => {
        if (item.type !== 'tool_call') return [];
        const result = turnItems.find(
          (candidate) => candidate.type === 'tool_result' && candidate.callId === item.call.id,
        );
        if (result?.type !== 'tool_result') return [];
        return [{ call: item.call, outcome: result.outcome }];
      });

      return reply(compose(planned.intent, context, planned.previousFocus, exchanges));
    },
  };
}
