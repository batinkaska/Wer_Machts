import { documentId, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { usersCol } from "../firebase/converters";
import type { AppUser } from "../types/user";

const MAX_IN_CLAUSE = 30;

export function useUsersByIds(ids: string[]) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const key = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += MAX_IN_CLAUSE) {
      chunks.push(ids.slice(i, i + MAX_IN_CLAUSE));
    }
    Promise.all(
      chunks.map((chunk) => getDocs(query(usersCol, where(documentId(), "in", chunk)))),
    ).then((snaps) => {
      if (!cancelled) setUsers(snaps.flatMap((snap) => snap.docs.map((d) => d.data())));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { users, loading };
}
