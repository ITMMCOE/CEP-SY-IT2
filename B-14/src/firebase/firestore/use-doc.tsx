
'use client';

import {
  DocumentReference,
  FirestoreError,
} from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';


export type DocumentHook<T> = {
  data: T | null | undefined;
  status: 'loading' | 'success' | 'error';
  error: FirestoreError | undefined;
};

export const useDoc = <T>(
  ref: DocumentReference | null
): DocumentHook<T> => {
  const [data, loading, error] = useDocumentData<T>(ref ?? undefined, {
    idField: 'id'
  });

  const getStatus = (): 'loading' | 'success' | 'error' => {
    if (loading) return 'loading';
    if (error) return 'error';
    return 'success';
  }

  return { data: data ?? null, status: getStatus(), error };
};
