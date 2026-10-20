import { cn } from './utils';

describe('cn', () => {
  it('keeps the text color when combined with a custom font size', () => {
    expect(cn('text-ui', 'text-primary-foreground')).toBe('text-ui text-primary-foreground');
    expect(cn('text-micro text-mint')).toBe('text-micro text-mint');
  });

  it('lets a later custom font size override an earlier one', () => {
    expect(cn('text-ui', 'text-small')).toBe('text-small');
  });

  it('resolves custom radius and shadow tokens as conflicts', () => {
    expect(cn('rounded-full', 'rounded-field')).toBe('rounded-field');
    expect(cn('shadow-md', 'shadow-overlay')).toBe('shadow-overlay');
  });
});
