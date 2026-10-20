import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CATEGORY_LABELS, SQUAD_CATEGORIES } from '@/features/bud/bud.constants';
import {
  athletesPatch,
  groupCounts,
  toggleAthleteId,
  toggleGroupIds,
} from '@/features/charts/charts.builder';
import { selectedAthletesCount } from '@/features/bud/graphSpec.utils';
import { getInitials } from '@/features/profile/profile.utils';
import { normalizeSearchText } from '@/features/conversations/conversations.utils';

import { chartAthletesStyles as styles } from './ChartAthletesPopover.styles';
import type { ChartAthletesPopoverProps } from './ChartAthletesPopover.types';

export function ChartAthletesPopover({
  atletas,
  roster,
  open,
  onOpenChange,
  onApply,
  trigger,
}: ChartAthletesPopoverProps) {
  const [query, setQuery] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>(atletas.modo === 'selecao' ? atletas.ids : []);
  const allMode = draftIds.length === 0;

  const counts = useMemo(() => groupCounts(roster), [roster]);
  const filtered = useMemo(() => {
    const needle = normalizeSearchText(query);
    if (!needle) return roster;
    return roster.filter((athlete) => normalizeSearchText(athlete.nome).includes(needle));
  }, [query, roster]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setQuery('');
      setDraftIds(atletas.modo === 'selecao' ? atletas.ids : []);
    }
    onOpenChange(next);
  };

  const applyCount = selectedAthletesCount(athletesPatch(draftIds));

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className={styles.content}>
        <div className={styles.search}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar atleta"
              className={styles.input}
              aria-label="Buscar atleta"
            />
          </div>
        </div>

        <div className={styles.body}>
          <label className={styles.row}>
            <Checkbox
              checked={allMode}
              onCheckedChange={(checked) => {
                if (checked) setDraftIds([]);
              }}
              aria-label="Todo o elenco"
            />
            Todo o elenco
          </label>

          <p className={styles.section}>Grupos</p>
          {SQUAD_CATEGORIES.map((category) => {
            const groupIds = roster
              .filter((athlete) => athlete.categoria === category)
              .map((athlete) => athlete.id);
            const selected =
              !allMode && groupIds.length > 0 && groupIds.every((id) => draftIds.includes(id));

            return (
              <label key={category} className={styles.row}>
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) =>
                    setDraftIds((current) =>
                      toggleGroupIds(allMode ? [] : current, groupIds, Boolean(checked)),
                    )
                  }
                  aria-label={CATEGORY_LABELS[category]}
                />
                {CATEGORY_LABELS[category]}
                <span className={styles.groupMeta}>{counts[category]} atletas</span>
              </label>
            );
          })}

          <p className={styles.section}>Atletas</p>
          {filtered.map((athlete) => {
            const checked = !allMode && draftIds.includes(athlete.id);
            return (
              <label key={athlete.id} className={styles.row}>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    setDraftIds((current) => toggleAthleteId(allMode ? [] : current, athlete.id))
                  }
                  aria-label={athlete.nome}
                />
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(athlete.nome)}</AvatarFallback>
                </Avatar>
                {athlete.nome}
              </label>
            );
          })}
        </div>

        <div className={styles.footer}>
          <Button variant="link" size="sm" onClick={() => setDraftIds([])}>
            Limpar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApply(athletesPatch(draftIds));
              onOpenChange(false);
            }}
          >
            Aplicar{applyCount > 0 ? ` (${applyCount})` : ''}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
