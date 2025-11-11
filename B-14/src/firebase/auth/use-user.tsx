
'use client';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '..';
import { useAuthState } from 'react-firebase-hooks/auth';

export type UserHook = {
  user: User | null | undefined;
  loading: boolean;
  claims: any;
};

export const useUser = (): UserHook => {
  const auth = useAuth();
  const [user, loading] = useAuthState(auth!);
  const [claims, setClaims] = useState<any>(null);

  useEffect(() => {
    const getClaims = async () => {
        if (user) {
            const { claims } = await user.getIdTokenResult();
            setClaims(claims);
        } else {
            setClaims(null);
        }
    };
    getClaims();
  }, [user]);

  return { user, loading, claims };
};
