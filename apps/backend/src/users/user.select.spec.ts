import {
  authenticationUserSelect,
  publicUserSelect,
  toPublicUser,
} from './user.select';

describe('User query projections', () => {
  it('never includes passwordHash in the public projection', () => {
    expect(publicUserSelect).not.toHaveProperty('passwordHash');
  });

  it('includes passwordHash only in the authentication projection', () => {
    expect(authenticationUserSelect.passwordHash).toBe(true);
  });

  it('removes passwordHash from an authenticated user record', () => {
    const publicUser = toPublicUser({
      id: 'user-1',
      email: 'player@example.com',
      name: 'Player',
      passwordHash: 'sensitive-hash',
      role: 'PLAYER',
      status: 'ACTIVE',
      authVersion: 0,
      clubId: null,
      position: null,
      birthDate: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(publicUser).not.toHaveProperty('passwordHash');
  });
});
