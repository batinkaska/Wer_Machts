import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { reviewsCol } from "../firebase/converters";
import type { Review } from "../types/review";

export function useReviewsForUser(uid: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(reviewsCol, where("revieweeId", "==", uid));
    return onSnapshot(q, (snap) => {
      setReviews(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
  }, [uid]);

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return { reviews, average, count, loading };
}
