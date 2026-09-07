import { getCountFromServer, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { usersCol } from "../firebase/converters";

export function useFollowerCount(uid: string | undefined) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setCount(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCountFromServer(query(usersCol, where("followingIds", "array-contains", uid)))
      .then((snap) => {
        if (!cancelled) setCount(snap.data().count);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return { count, loading };
}
