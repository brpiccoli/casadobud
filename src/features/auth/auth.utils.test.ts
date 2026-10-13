import { isEmailAllowed, parseEmailList } from './auth.utils';

describe('parseEmailList', () => {
  it('returns an empty list when the value is missing or blank', () => {
    expect(parseEmailList(undefined)).toEqual([]);
    expect(parseEmailList('  ,  ')).toEqual([]);
  });

  it('normalizes case and whitespace', () => {
    expect(parseEmailList(' Suporte@FaleComBud.com.br , outra@clube.com ')).toEqual([
      'suporte@falecombud.com.br',
      'outra@clube.com',
    ]);
  });
});

describe('isEmailAllowed', () => {
  const allowed = ['suporte@falecombud.com.br'];

  it('allows everyone when the list is empty', () => {
    expect(isEmailAllowed('atleta@gmail.com', [])).toBe(true);
  });

  it('allows listed emails regardless of case', () => {
    expect(isEmailAllowed('SUPORTE@falecombud.com.br', allowed)).toBe(true);
  });

  it('blocks unlisted or missing emails', () => {
    expect(isEmailAllowed('atleta@gmail.com', allowed)).toBe(false);
    expect(isEmailAllowed(undefined, allowed)).toBe(false);
  });
});
