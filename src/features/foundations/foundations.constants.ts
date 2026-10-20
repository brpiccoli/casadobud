import type { SeriesChart } from '@/features/charts/charts.types';

import type { ColorSwatch, TypeSample } from './foundations.types';

export const COLOR_SWATCHES: ColorSwatch[] = [
  { label: 'bg', cssVar: '--background', className: 'bg-background' },
  { label: 'surface', cssVar: '--card', className: 'bg-card' },
  { label: 'pill', cssVar: '--pill', className: 'bg-pill' },
  { label: 'text', cssVar: '--foreground', className: 'bg-foreground' },
  { label: 'mint · acento', cssVar: '--mint', className: 'bg-mint' },
  { label: 'text-2', cssVar: '--muted-foreground', className: 'bg-muted-foreground' },
  { label: 'sage', cssVar: '--sage', className: 'bg-sage' },
  { label: 'slate', cssVar: '--slate', className: 'bg-slate' },
  { label: 'taupe', cssVar: '--taupe', className: 'bg-taupe' },
];

export const TYPE_SCALE: TypeSample[] = [
  { token: 'display', className: 'font-heading text-display', sample: 'Display' },
  { token: 'title', className: 'font-heading text-title', sample: 'Título' },
  { token: 'headline', className: 'font-heading text-headline', sample: 'Destaque' },
  { token: 'subhead', className: 'font-heading text-subhead', sample: 'Seção' },
  { token: 'prompt', className: 'text-prompt', sample: 'Envie uma mensagem' },
  { token: 'body-lg', className: 'text-body-lg', sample: 'Campo e título de card' },
  { token: 'ui', className: 'text-ui', sample: 'Botão e item de menu' },
  { token: 'copy', className: 'text-copy', sample: 'Parágrafo de apoio' },
  { token: 'ui-sm', className: 'text-ui-sm', sample: 'Chip e lista' },
  { token: 'small', className: 'text-small', sample: 'Botão pequeno' },
  { token: 'caption', className: 'text-caption', sample: 'Label de campo' },
  { token: 'meta', className: 'text-meta', sample: 'Rodapé e metadados' },
  { token: 'overline', className: 'text-overline uppercase', sample: 'Rótulo de seção' },
  { token: 'micro', className: 'text-micro uppercase', sample: 'Tag' },
];

export const ANATOMY_CHART: SeriesChart = {
  id: 'foundations-anatomy',
  kind: 'line',
  origin: 'preset',
  title: 'Título do gráfico',
  footer: 'Rodapé · atualização e origem',
  layout: { x: 0, y: 0, w: 8, h: 2 },
  points: [
    { label: '1', value: 40 },
    { label: '2', value: 44 },
    { label: '3', value: 50 },
    { label: '4', value: 52 },
    { label: '5', value: 46 },
    { label: '6', value: 38 },
    { label: '7', value: 36 },
    { label: '8', value: 42 },
    { label: '9', value: 52 },
    { label: '10', value: 58 },
  ],
};
