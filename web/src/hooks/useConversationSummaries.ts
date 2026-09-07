import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { adsCol, usersCol } from "../firebase/converters";
import type { ChatMessage } from "../types/message";
import { useMyConversations } from "./useMessages";

export interface ConversationSummary {
  conversationId: string;
  adId: string;
  otherUid: string;
  lastMessage: ChatMessage;
  adTitle: string;
  adPhotoUrl: string | null;
  adStatus: string | null;
  otherName: string;
}

interface RawSummary {
  conversationId: string;
  adId: string;
  otherUid: string;
  lastMessage: ChatMessage;
}

function summarize(messages: ChatMessage[], uid: string): RawSummary[] {
  const byConversation = new Map<string, ChatMessage>();
  for (const message of messages) {
    if (!byConversation.has(message.conversationId)) {
      byConversation.set(message.conversationId, message);
    }
  }
  return [...byConversation.values()].map((lastMessage) => ({
    conversationId: lastMessage.conversationId,
    adId: lastMessage.adId,
    otherUid: lastMessage.senderId === uid ? lastMessage.recipientId : lastMessage.senderId,
    lastMessage,
  }));
}

export function useConversationSummaries(uid: string | undefined) {
  const { messages, loading: messagesLoading } = useMyConversations(uid);
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [enriching, setEnriching] = useState(true);

  const rawSummaries = useMemo(() => (uid ? summarize(messages, uid) : []), [messages, uid]);

  useEffect(() => {
    if (rawSummaries.length === 0) {
      setSummaries([]);
      setEnriching(false);
      return;
    }
    let cancelled = false;
    setEnriching(true);
    Promise.all(
      rawSummaries.map(async (raw) => {
        const [adSnap, userSnap] = await Promise.all([
          getDoc(doc(adsCol, raw.adId)),
          getDoc(doc(usersCol, raw.otherUid)),
        ]);
        return {
          ...raw,
          adTitle: adSnap.exists() ? adSnap.data().title : "",
          adPhotoUrl: adSnap.exists() ? (adSnap.data().photoUrls[0] ?? null) : null,
          adStatus: adSnap.exists() ? adSnap.data().status : null,
          otherName: userSnap.exists() ? userSnap.data().displayName : "",
        };
      }),
    ).then((results) => {
      if (!cancelled) {
        setSummaries(results);
        setEnriching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [rawSummaries]);

  return { summaries, loading: messagesLoading || enriching };
}
