import { getInitials, resolveDisplayName, resolveRoleLabel } from './profile.utils';

const EMPTY_PROFILE = {
  name: null,
  first_name: null,
  last_name: null,
  occupation: null,
  company_name: null,
};

describe('resolveDisplayName', () => {
  it('prioriza o nome do perfil', () => {
    expect(resolveDisplayName({ ...EMPTY_PROFILE, name: 'Bruno Perna' }, 'b@clube.com.br')).toBe(
      'Bruno Perna',
    );
  });

  it('usa nome e sobrenome quando não há nome completo', () => {
    expect(resolveDisplayName({ ...EMPTY_PROFILE, first_name: 'Bruno', last_name: 'Perna' })).toBe(
      'Bruno Perna',
    );
  });

  it('cai para o usuário do email', () => {
    expect(resolveDisplayName(EMPTY_PROFILE, 'bruno.perna@clube.com.br')).toBe('bruno.perna');
  });
});

describe('resolveRoleLabel', () => {
  it('junta ocupação e clube', () => {
    expect(
      resolveRoleLabel({
        ...EMPTY_PROFILE,
        occupation: 'Psicólogo',
        company_name: 'Juventus Mooca',
      }),
    ).toBe('Psicólogo · Juventus Mooca');
  });

  it('ignora campos vazios', () => {
    expect(resolveRoleLabel({ ...EMPTY_PROFILE, occupation: 'Psicólogo', company_name: ' ' })).toBe(
      'Psicólogo',
    );
  });
});

describe('getInitials', () => {
  it('usa primeira e última palavra', () => {
    expect(getInitials('Bruno de Souza Perna')).toBe('BP');
  });

  it('usa uma letra para nome único', () => {
    expect(getInitials('bruno')).toBe('B');
  });
});
