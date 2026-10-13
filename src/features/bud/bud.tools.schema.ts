import {
  BUD_CATEGORIES,
  BUD_METRICS,
  GRAPH_GROUPINGS,
  GRAPH_TYPES,
  PERIOD_DAYS_OPTIONS,
} from './bud.constants';
import type { BudToolName } from './bud.types';

export interface JsonSchema {
  type?: 'object' | 'array' | 'string' | 'integer';
  description?: string;
  enum?: readonly (string | number)[];
  properties?: Record<string, JsonSchema>;
  required?: readonly string[];
  items?: JsonSchema;
  oneOf?: readonly JsonSchema[];
  format?: string;
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
}

export interface BudToolDefinition {
  name: BudToolName;
  description: string;
  parameters: JsonSchema;
}

const PERIOD_SCHEMA: JsonSchema = {
  description: 'Período da consulta.',
  oneOf: [
    {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['ultimos_dias'] },
        dias: { type: 'integer', enum: PERIOD_DAYS_OPTIONS },
      },
      required: ['tipo', 'dias'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['intervalo'] },
        inicio: { type: 'string', format: 'date' },
        fim: { type: 'string', format: 'date' },
      },
      required: ['tipo', 'inicio', 'fim'],
      additionalProperties: false,
    },
  ],
};

const ATHLETES_SCHEMA: JsonSchema = {
  description: 'Todos os atletas da categoria ou uma seleção por id (ids do elenco no contexto).',
  oneOf: [
    {
      type: 'object',
      properties: { modo: { type: 'string', enum: ['todos'] } },
      required: ['modo'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        modo: { type: 'string', enum: ['selecao'] },
        ids: { type: 'array', items: { type: 'string' }, minItems: 1 },
      },
      required: ['modo', 'ids'],
      additionalProperties: false,
    },
  ],
};

const SPEC_FIELDS: Record<string, JsonSchema> = {
  titulo: { type: 'string', description: 'Opcional. Sem travessão ou hífen como separador.' },
  tipo: { type: 'string', enum: GRAPH_TYPES },
  metrica: { type: 'string', enum: BUD_METRICS },
  periodo: PERIOD_SCHEMA,
  categoria: {
    type: 'array',
    description: '2 itens = comparação (Sub-15 vs Sub-17). elenco_todo não combina com outras.',
    items: { type: 'string', enum: BUD_CATEGORIES },
    minItems: 1,
    maxItems: 2,
  },
  atletas: ATHLETES_SCHEMA,
  agrupamento: {
    type: 'string',
    enum: GRAPH_GROUPINGS,
    description: 'Ignorado quando tipo = kpi.',
  },
};

const GRAPH_ID_SCHEMA: JsonSchema = {
  type: 'string',
  description: 'id do gráfico devolvido por criar_grafico ou o id do grafico_em_foco.',
};

export const BUD_TOOL_DEFINITIONS: BudToolDefinition[] = [
  {
    name: 'consultar_metricas',
    description:
      'Busca as métricas do companion e devolve as séries. Sempre chame antes de afirmar qualquer número.',
    parameters: {
      type: 'object',
      properties: {
        metrica: SPEC_FIELDS.metrica,
        periodo: SPEC_FIELDS.periodo,
        categoria: SPEC_FIELDS.categoria,
        atletas: SPEC_FIELDS.atletas,
        agrupamento: SPEC_FIELDS.agrupamento,
      },
      required: ['metrica', 'periodo', 'categoria', 'atletas', 'agrupamento'],
      additionalProperties: false,
    },
  },
  {
    name: 'criar_grafico',
    description: 'Cria um rascunho de gráfico (v1) a partir de um GraphSpec. Devolve o id.',
    parameters: {
      type: 'object',
      properties: {
        spec: {
          type: 'object',
          properties: {
            ...SPEC_FIELDS,
            origem: { type: 'string', enum: ['predefinido', 'chat'] },
          },
          required: ['origem', 'tipo', 'metrica', 'periodo', 'categoria', 'atletas', 'agrupamento'],
          additionalProperties: false,
        },
      },
      required: ['spec'],
      additionalProperties: false,
    },
  },
  {
    name: 'ajustar_grafico',
    description:
      'Aplica um patch no gráfico e cria uma nova versão (v1 para v2). A versão anterior é preservada.',
    parameters: {
      type: 'object',
      properties: {
        id: GRAPH_ID_SCHEMA,
        patch: { type: 'object', properties: SPEC_FIELDS, additionalProperties: false },
      },
      required: ['id', 'patch'],
      additionalProperties: false,
    },
  },
  {
    name: 'salvar_grafico',
    description:
      'Pede para salvar o gráfico no dashboard. O app sempre pede confirmação ao usuário (voz ou toque) antes de salvar.',
    parameters: {
      type: 'object',
      properties: { id: GRAPH_ID_SCHEMA },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'descartar_grafico',
    description: 'Descarta o rascunho do gráfico.',
    parameters: {
      type: 'object',
      properties: { id: GRAPH_ID_SCHEMA },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'abrir_no_builder',
    description: 'Leva o usuário do chat para a tela de Gráficos com o rascunho aberto.',
    parameters: {
      type: 'object',
      properties: { id: GRAPH_ID_SCHEMA },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'confirmar_por_voz',
    description:
      'Só no modo voz_ao_vivo. Registra a resposta do usuário à pergunta "Era isso que você tinha em mente?".',
    parameters: {
      type: 'object',
      properties: {
        id: GRAPH_ID_SCHEMA,
        resposta: { type: 'string', enum: ['salvar', 'ajustar'] },
      },
      required: ['id', 'resposta'],
      additionalProperties: false,
    },
  },
];
