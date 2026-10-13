import type { DashboardChart } from './charts.types';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function buildDashboardChartsMock(): DashboardChart[] {
  return [
    {
      id: 'line-placeholder',
      kind: 'line',
      origin: 'preset',
      title: 'Gráfico de linha (placeholder)',
      footer: 'Atualizado há 2 horas · dados do companion',
      points: [
        { label: 'S1', value: 42, comparison: 30 },
        { label: 'S2', value: 55, comparison: 36 },
        { label: 'S3', value: 58, comparison: 41 },
        { label: 'S4', value: 49, comparison: 38 },
        { label: 'S5', value: 51, comparison: 44 },
        { label: 'S6', value: 66, comparison: 49 },
        { label: 'S7', value: 76, comparison: 47 },
        { label: 'S8', value: 70, comparison: 52 },
      ],
      highlightIndex: 6,
    },
    {
      id: 'kpi-a',
      kind: 'kpi',
      origin: 'preset',
      title: 'Métrica A (placeholder)',
      footer: '',
      value: '82%',
      caption: '+4 pts vs semana anterior',
      trend: 'up',
    },
    {
      id: 'kpi-b',
      kind: 'kpi',
      origin: 'preset',
      title: 'Métrica B (placeholder)',
      footer: '',
      value: '17',
      caption: 'estável na semana',
      trend: 'flat',
    },
    {
      id: 'bars-placeholder',
      kind: 'bar',
      origin: 'preset',
      title: 'Barras (placeholder)',
      footer: 'Atualizado há 2 horas',
      points: [48, 62, 36, 74, 57, 66, 50].map((value, index) => ({
        label: WEEKDAYS[index],
        value,
      })),
      highlightIndex: 3,
    },
    {
      id: 'donut-placeholder',
      kind: 'donut',
      origin: 'custom',
      title: 'Distribuição (placeholder)',
      footer: 'Criado por você via chat',
      percentage: 45,
    },
    {
      id: 'area-placeholder',
      kind: 'area',
      origin: 'preset',
      title: 'Área (placeholder)',
      footer: 'Atualizado há 2 horas',
      points: [30, 42, 50, 44, 34, 40, 58, 66].map((value, index) => ({
        label: `S${index + 1}`,
        value,
      })),
    },
  ];
}
