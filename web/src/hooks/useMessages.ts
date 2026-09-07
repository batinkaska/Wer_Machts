import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { messagesCol } from "../firebase/converters";
import type { ChatMessage } from "../types/message";

export function useMessages(conversationId: string | undefined, uid: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !uid) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Firestore can't validate a security rule keyed on `participantIds` against
    // a query that only filters by `conversationId` — the whole query gets
    // rejected as "insufficient permissions" even for a legitimate participant.
    // Filtering on `participantIds array-contains uid` instead (same shape as
    // useMyConversations, which is already permitted) and narrowing to this
    // conversation client-side avoids needing a new composite index/rule.
    const q = query(
      messagesCol,
      where("participantIds", "array-contains", uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const mine = snap.docs
          .map((d) => d.data())
          .filter((m) => m.conversationId === conversationId)
          .reverse();
        setMessages(mine);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, [conversationId, uid]);

  return { messages, loading };
}

export function useMyConversations(uid: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      messagesCol,
      where("participantIds", "array-contains", uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, [uid]);

  return { messages, loading };
}
