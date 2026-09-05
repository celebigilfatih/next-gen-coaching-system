export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'SYSTEM_ADMIN' | 'CLUB_ADMIN' | 'COACH' | 'PLAYER';
  clubId: string | null;
};

type Session = {
  token: string;
  user: SessionUser;
  persistent?: boolean;
} | null;

let session: Session = null;
let generation = 0;
const listeners = new Set<() => void>();
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function getSessionGeneration() {
  return generation;
}

export function getSession() {
  return session;
}

export function setSession(nextSession: NonNullable<Session>) {
  session = nextSession;
  listeners.forEach((listener) => listener());
}

export function clearSession() {
  generation += 1;
  session = null;
  listeners.forEach((listener) => listener());
}
