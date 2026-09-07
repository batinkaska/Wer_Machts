import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { reviewsCol } from "../firebase/converters";
import type { Review } from "../types/review";

export function useReviewsForConversation(conversationId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(reviewsCol, where("conversationId", "==", conversationId));
    return onSnapshot(q, (snap) => {
      setReviews(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
  }, [conversationId]);

  return { reviews, loading };
}
