import { formatLongWeekdayDate } from './dateFormat';

describe('formatLongWeekdayDate', () => {
  it('formata com dia da semana capitalizado, como no header do chat', () => {
    expect(formatLongWeekdayDate(new Date('2026-09-29T12:00:00'))).toBe(
      'Terça-feira, 29 de setembro',
    );
  });
});
