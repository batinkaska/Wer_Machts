import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { functions } from "../../firebase/config";
import { friendlyErrorMessage } from "../../lib/friendlyError";
import { useReviewsForConversation } from "../../hooks/useReviewsForConversation";
import { StarIcon } from "../icons";
import { StarRatingInput } from "./StarRating";

const submitReviewFn = httpsCallable(functions, "submitReview");

interface ReviewBoxProps {
  conversationId: string;
  adId?: string;
  revieweeId: string;
  revieweeName: string;
}

export function ReviewBox({ conversationId, adId, revieweeId, revieweeName }: ReviewBoxProps) {
  const { t } = useTranslation();
  const { firebaseUser } = useAuth();
  const { reviews } = useReviewsForConversation(conversationId);
  const myReview = reviews.find(
    (r) => r.reviewerId === firebaseUser?.uid && r.revieweeId === revieweeId,
  );

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!firebaseUser || rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReviewFn({
        conversationId,
        ...(adId ? { adId } : {}),
        revieweeId,
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "adForm.errorSaveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (myReview) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${i <= myReview.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{t("messages.rateThanks")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("messages.ratePrompt", { name: revieweeName })}
      </p>
      <StarRatingInput value={rating} onChange={setRating} />
      {rating > 0 && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("messages.commentPlaceholder")}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded bg-[#5fac5e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
          >
            {t("messages.rateSubmit")}
          </button>
        </div>
      )}
    </div>
  );
}
