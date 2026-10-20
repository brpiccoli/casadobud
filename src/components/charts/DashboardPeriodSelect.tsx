import { Calendar, ChevronDown } from 'lucide-react';

import { Chip } from '@/components/ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DASHBOARD_PERIOD_OPTIONS } from '@/features/charts/charts.constants';
import { cn } from '@/lib/utils';

import type { DashboardPeriodSelectProps } from './ChartCard.types';

export function DashboardPeriodSelect({ value, onChange, disabled }: DashboardPeriodSelectProps) {
  const current = DASHBOARD_PERIOD_OPTIONS.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Chip disabled={disabled} aria-label="Período">
          <Calendar />
          {current?.label}
          <ChevronDown />
        </Chip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[210px]">
        {DASHBOARD_PERIOD_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
              aria-checked={selected}
              role="menuitemradio"
            >
              <span
                className={cn(
                  'flex size-4 items-center justify-center rounded-full border-[1.5px]',
                  selected ? 'border-mint' : 'border-border-strong',
                )}
                aria-hidden
              >
                {selected ? <span className="size-2 rounded-full bg-mint" /> : null}
              </span>
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
