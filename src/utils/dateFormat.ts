import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatLongWeekdayDate(date: Date): string {
  return capitalizeFirst(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }));
}
