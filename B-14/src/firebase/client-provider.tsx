
'use client';

import React from 'react';
import { FirebaseProvider } from '.';
import { auth, firebaseApp, firestore } from './client';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
}
