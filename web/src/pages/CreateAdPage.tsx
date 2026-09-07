import { addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AdForm } from "../components/ads/AdForm";
import { adsCol } from "../firebase/converters";
import { useAuth } from "../contexts/AuthContext";
import type { NewAd } from "../types/ad";

export function CreateAdPage() {
  const { t } = useTranslation();
  const { firebaseUser, appUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: NewAd, action: "publish" | "draft") {
    if (!firebaseUser || !appUser) return;
    setSubmitting(true);
    try {
      const docRef = await addDoc(adsCol, {
        ...values,
        ownerId: firebaseUser.uid,
        ownerName: appUser.displayName,
        status: action === "draft" ? "draft" : "open",
        bidCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as never);
      navigate(action === "draft" ? "/my-ads" : `/ads/${docRef.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("home.createAd")}</h1>
      <AdForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
