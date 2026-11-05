import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { publicProfilesCol } from "../firebase/converters";
import type { PublicProfile } from "../types/user";

export function useFollowers(uid: string | undefined) {
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(publicProfilesCol, where("followingIds", "array-contains", uid));
    return onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
  }, [uid]);

  return { users, loading };
}
