import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { usersCol } from "../firebase/converters";
import type { AppUser } from "../types/user";

export function useFollowers(uid: string | undefined) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(usersCol, where("followingIds", "array-contains", uid));
    return onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
  }, [uid]);

  return { users, loading };
}
