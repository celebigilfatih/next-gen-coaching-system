export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'SYSTEM_ADMIN' | 'CLUB_ADMIN' | 'COACH' | 'PLAYER';
  clubId: string | null;
};

type Session = { token: string; user: SessionUser } | null;

let session: Session = null;

export function getSession() {
  return session;
}

export function setSession(nextSession: NonNullable<Session>) {
  session = nextSession;
}

export function clearSession() {
  session = null;
}
