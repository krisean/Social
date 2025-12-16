import type { DocumentData, FirestoreDataConverter } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

type WithId<T> = T & { id: string };

export function toIsoDate(value: unknown | Timestamp | null | undefined) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return undefined;
}

export function buildConverter<T extends DocumentData>(
  mapFrom: (data: DocumentData, docId: string) => T,
  mapTo?: (data: T) => DocumentData,
): FirestoreDataConverter<WithId<T>> {
  return {
    toFirestore: (value) =>
      mapTo ? mapTo(value as T) : (value as DocumentData),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();
      return {
        ...mapFrom(data, snapshot.id),
        id: snapshot.id,
      };
    },
  };
}
