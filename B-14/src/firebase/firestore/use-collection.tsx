
'use client';
import {
  FirestoreError,
  Query,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

export type CollectionHook<T> = {
  data: T[] | null | undefined;
  status: 'loading' | 'success' | 'error';
  error: FirestoreError | undefined;
};

export const useCollection = <T>(
  query: Query | null
): CollectionHook<T> => {
  const [data, loading, error] = useCollectionData<T>(query ?? undefined, {
    idField: 'id'
  });
  
  const getStatus = (): 'loading' | 'success' | 'error' => {
    if (loading) return 'loading';
    if (error) return 'error';
    return 'success';
  }

  return { data, status: getStatus(), error };
};
