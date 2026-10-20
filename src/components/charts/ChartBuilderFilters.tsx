import { useState } from 'react';
import { ChartColumn, ChevronDown, Users } from 'lucide-react';

import { ChartAthletesPopover } from '@/components/charts/ChartAthletesPopover';
import { Chip } from '@/components/ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CATEGORY_LABELS, GRAPH_TYPE_LABELS, GRAPH_TYPES } from '@/features/bud/bud.constants';
import {
  athletesChipLabel,
  BUILDER_PERIOD_OPTIONS,
  canCompareType,
  categoryChipLabel,
  categoryPatch,
  comparePatch,
  periodChipLabel,
  periodPatch,
  typeChipLabel,
  typePatch,
  visibleRoster,
} from '@/features/charts/charts.builder';
import { isComparison } from '@/features/bud/graphSpec.utils';
import { cn } from '@/lib/utils';

import { chartBuilderFiltersStyles as styles } from './ChartBuilderFilters.styles';
import type { ChartBuilderFiltersProps } from './ChartBuilderFilters.types';

export function ChartBuilderFilters({ spec, roster, onPatch }: ChartBuilderFiltersProps) {
  const [athletesOpen, setAthletesOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const comparing = isComparison(spec);
  const compareEnabled = canCompareType(spec.tipo);

  const periodValue = spec.periodo.tipo === 'ultimos_dias' ? String(spec.periodo.dias) : 'custom';

  return (
    <div className={styles.root}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Chip>
            Tipo · {typeChipLabel(spec.tipo)}
            <ChevronDown />
          </Chip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {GRAPH_TYPES.map((tipo) => (
            <DropdownMenuItem
              key={tipo}
              disabled={comparing && !canCompareType(tipo)}
              onSelect={() => onPatch(typePatch(tipo, spec))}
            >
              {GRAPH_TYPE_LABELS[tipo]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Chip>
            Período · {periodChipLabel(spec.periodo)}
            <ChevronDown />
          </Chip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={periodValue}
            onValueChange={(value) => {
              const option = BUILDER_PERIOD_OPTIONS.find((item) => String(item.dias) === value);
              if (option) onPatch(periodPatch(option.dias));
            }}
          >
            {BUILDER_PERIOD_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.dias} value={String(option.dias)}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
        <PopoverTrigger asChild>
          <Chip selected={categoryOpen}>
            Categoria · {categoryChipLabel(spec.categoria)}
            <ChevronDown />
          </Chip>
        </PopoverTrigger>
        <PopoverContent align="start" className={styles.categoryMenu}>
          {(['elenco_todo', 'sub_15', 'sub_17'] as const).map((category) => {
            const active = !comparing && spec.categoria[0] === category;
            return (
              <button
                key={category}
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  onPatch(categoryPatch(category, spec));
                  setCategoryOpen(false);
                }}
              >
                <span className={cn(styles.radio, active && styles.radioOn)}>
                  {active ? <span className={styles.radioDot} /> : null}
                </span>
                {CATEGORY_LABELS[category]}
              </button>
            );
          })}
          <div className={styles.menuDivider} />
          <button
            type="button"
            className={styles.menuItem}
            disabled={!compareEnabled}
            onClick={() => {
              onPatch(categoryPatch('compare', spec));
              setCategoryOpen(false);
            }}
          >
            <ChartColumn className={styles.compareIcon} />
            Comparar Sub-15 + Sub-17
          </button>
        </PopoverContent>
      </Popover>

      <ChartAthletesPopover
        atletas={spec.atletas}
        roster={visibleRoster(roster, spec.categoria, '')}
        open={athletesOpen}
        onOpenChange={setAthletesOpen}
        onApply={(atletas) => onPatch({ atletas })}
        trigger={
          <Chip selected={athletesOpen}>
            <Users />
            Atletas · {athletesChipLabel(spec.atletas)}
            <ChevronDown />
          </Chip>
        }
      />

      <Chip
        selected={comparing}
        disabled={!compareEnabled}
        onClick={() => onPatch(comparePatch(!comparing, spec))}
      >
        <ChartColumn />
        Comparar
      </Chip>
    </div>
  );
}
