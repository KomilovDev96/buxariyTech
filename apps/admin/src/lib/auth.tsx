import { createContext, useContext, useEffect, useState } from 'react';
import type { SafeUser } from '@buhariy/contracts';
import { api, save } from './api';
type Auth = {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    api<SafeUser>('/auth/me', {}, false)
      .catch(() => save<SafeUser>('/auth/refresh', {}))
      .then((u) => {
        if (live) setUser(u);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    return () => {
      live = false;
      window.removeEventListener('session-expired', expired);
    };
  }, []);
  return (
    <Context.Provider
      value={{
        user,
        loading,
        async login(email, password) {
          setUser(await save<SafeUser>('/auth/login', { email, password }));
        },
        async logout() {
          await save('/auth/logout', {});
          setUser(null);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider missing');
  return value;
}
