import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "../components/icons";
import { SupportContributionStep } from "../components/payment/SupportContributionStep";
import { useAuth } from "../contexts/AuthContext";
import { adsCol, bidBankDetailsDoc, bidsCol } from "../firebase/converters";
import { functions } from "../firebase/config";
import { useAd } from "../hooks/useAd";
import { logAnalyticsEvent } from "../lib/analytics";
import { friendlyErrorMessage } from "../lib/friendlyError";
import { isValidIbanFormat, maskIban, normalizeIban } from "../lib/iban";
import type { Bid, BidBankDetails, PaymentMethod } from "../types/bid";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const createPaymentIntentFn = httpsCallable(functions, "createPaymentIntent");
const confirmPaymentStatusFn = httpsCallable(functions, "confirmPaymentStatus");

function StripeCardForm({ bidId, onPaid }: { bidId: string; onPaid: () => void }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? t("payment.cardError"));
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: window.location.href },
      });

      if (confirmError) {
        setError(confirmError.message ?? t("payment.cardError"));
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await confirmPaymentStatusFn({ bidId });
        logAnalyticsEvent("payment_completed", { method: "card" });
        onPaid();
      } else {
        setError(t("payment.cardError"));
      }
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "payment.cardError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-[#5fac5e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
      >
        {submitting ? t("payment.processing") : t("payment.payNow")}
      </button>
    </div>
  );
}

function PaidConfirmation({
  isPayer,
  amount,
  supportAmount,
  processingFee,
  counterpartyName,
}: {
  isPayer: boolean;
  amount: number;
  supportAmount?: number;
  processingFee?: number;
  counterpartyName: string;
}) {
  const { t } = useTranslation();
  // The processing-fee surcharge is what the payer's card was actually charged —
  // the recipient never sees or receives it, they only ever get amount + support.
  const total = amount + (supportAmount ?? 0) + (isPayer ? processingFee ?? 0 : 0);

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
        <CheckCircleIcon className="h-8 w-8" />
      </span>
      <div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isPayer ? t("payment.paidTitlePayer") : t("payment.paidTitleRecipient")}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {isPayer
            ? t("payment.paidMessagePayer", { amount: total, name: counterpartyName })
            : t("payment.paidMessageRecipient", { amount: total, name: counterpartyName })}
        </p>
        {(!!supportAmount || (isPayer && !!processingFee)) && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p>{t("payment.paidBreakdownService", { amount })}</p>
            {!!supportAmount && <p>{t("payment.paidBreakdownSupport", { amount: supportAmount })}</p>}
            {isPayer && !!processingFee && (
              <p>{t("payment.paidBreakdownProcessingFee", { amount: processingFee })}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipientBankDetails({ bidId }: { bidId: string }) {
  const { t } = useTranslation();
  const [details, setDetails] = useState<BidBankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(bidBankDetailsDoc(bidId), (snap) => {
      const data = snap.exists() ? snap.data() : null;
      setDetails(data);
      setAccountHolderName(data?.accountHolderName ?? "");
      setIban(data?.iban ?? "");
      setLoading(false);
    });
  }, [bidId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!accountHolderName.trim()) {
      setError(t("payment.bankDetailsNameRequired"));
      return;
    }
    if (!isValidIbanFormat(iban)) {
      setError(t("payment.bankDetailsIbanInvalid"));
      return;
    }
    setSaving(true);
    try {
      await setDoc(bidBankDetailsDoc(bidId), {
        accountHolderName: accountHolderName.trim(),
        iban: normalizeIban(iban),
        updatedAt: serverTimestamp(),
      } as BidBankDetails);
      setEditing(false);
    } catch (err) {
      setError(friendlyErrorMessage(err, t, "adForm.errorSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("payment.bankDetailsHeading")}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("payment.bankDetailsIntro")}</p>

      {details && !editing ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>{details.accountHolderName}</p>
            <p className="font-mono">{maskIban(details.iban)}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-sm text-[#5fac5e] hover:underline"
          >
            {t("common.edit")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="bankDetailsAccountHolder"
              className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {t("payment.accountHolderLabel")}
            </label>
            <input
              id="bankDetailsAccountHolder"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="bankDetailsIban"
              className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {t("payment.ibanLabel")}
            </label>
            <input
              id="bankDetailsIban"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="DE00 0000 0000 0000 0000 00"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#5fac5e] px-4 py-2 text-sm font-medium text-white hover:bg-[#4d9a4c] disabled:opacity-50"
            >
              {saving ? t("adDetail.sending") : t("common.save")}
            </button>
            {details && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setAccountHolderName(details.accountHolderName);
                  setIban(details.iban);
                  setError(null);
                }}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t("common.cancel")}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export function PaymentPage() {
  const { t } = useTranslation();
  const { adId } = useParams<{ adId: string }>();
  const [searchParams] = useSearchParams();
  const bidId = searchParams.get("bidId");
  const { firebaseUser } = useAuth();
  const { ad, loading: adLoading } = useAd(adId);

  const [bid, setBid] = useState<Bid | null>(null);
  const [bidLoading, setBidLoading] = useState(true);
  const [saving, setSaving] = useState<PaymentMethod | null>(null);
  const [changingMethod, setChangingMethod] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [startingCardPayment, setStartingCardPayment] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showSupportStep, setShowSupportStep] = useState(false);

  useEffect(() => {
    if (!bidId) {
      setBidLoading(false);
      return;
    }
    return onSnapshot(doc(bidsCol, bidId), (snap) => {
      setBid(snap.exists() ? snap.data() : null);
      setBidLoading(false);
    });
  }, [bidId]);

  const payerId = ad && bid ? (ad.adKind === "biete" ? bid.providerId : ad.ownerId) : undefined;
  const isPayer = !!firebaseUser && firebaseUser.uid === payerId;
  const isPaid = bid?.paymentStatus === "paid";
  const payerName = ad && bid ? (ad.adKind === "biete" ? bid.providerName : ad.ownerName) : "";
  const recipientName = ad && bid ? (ad.adKind === "biete" ? ad.ownerName : bid.providerName) : "";

  async function chooseCash() {
    if (!bidId || !ad || !bid || !isPayer) return;
    setSaving("cash");
    try {
      if (bid.status === "accepted") {
        await updateDoc(doc(bidsCol, bidId), { paymentMethod: "cash" });
      } else {
        await updateDoc(doc(bidsCol, bidId), { status: "accepted", paymentMethod: "cash" });
        await updateDoc(doc(adsCol, ad.id), { status: "in_progress", updatedAt: serverTimestamp() });
        // The bid_accepted notification is created server-side by onBidWritten.
      }
      logAnalyticsEvent("payment_completed", { method: "cash" });
      setChangingMethod(false);
    } finally {
      setSaving(null);
    }
  }

  async function startCardPayment(supportAmount: number) {
    if (!bidId) return;
    setStartError(null);
    setStartingCardPayment(true);
    try {
      const result = await createPaymentIntentFn({ bidId, supportAmount });
      setClientSecret((result.data as { clientSecret: string }).clientSecret);
      setChangingMethod(false);
      setShowSupportStep(false);
    } catch (err) {
      setStartError(friendlyErrorMessage(err, t, "payment.cardError"));
    } finally {
      setStartingCardPayment(false);
    }
  }

  if (adLoading || bidLoading) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </p>
    );
  }

  if (!ad || !bid) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("payment.notFound")}
      </p>
    );
  }

  const isParticipant =
    !!firebaseUser && (firebaseUser.uid === ad.ownerId || firebaseUser.uid === bid.providerId);

  if (!isParticipant) {
    return (
      <p className="mx-auto max-w-md px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("payment.notAuthorized")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {t("payment.pageTitle")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{ad.title}</p>
      <p className="mt-1 text-xl font-bold text-[#5fac5e]">{bid.amount} €</p>

      <div className="mt-6 rounded-lg border border-gray-200 p-5 dark:border-gray-700">
        {bid.paymentMethod === "card" && isPaid ? (
          <PaidConfirmation
            isPayer={isPayer}
            amount={bid.amount}
            supportAmount={bid.supportAmount}
            processingFee={bid.processingFee}
            counterpartyName={isPayer ? recipientName : payerName}
          />
        ) : bid.paymentMethod && !changingMethod ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("payment.chosen", { method: t(`payment.method.${bid.paymentMethod}`) })}
              </p>
              {isPayer && !isPaid && (
                <button
                  type="button"
                  onClick={() => {
                    setChangingMethod(true);
                    setClientSecret(null);
                  }}
                  className="shrink-0 text-sm text-[#5fac5e] hover:underline"
                >
                  {t("payment.changeMethod")}
                </button>
              )}
            </div>
            {bid.paymentMethod === "card" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("payment.cardPendingNote")}
              </p>
            )}
          </div>
        ) : isPayer ? (
          clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCardForm bidId={bidId!} onPaid={() => setClientSecret(null)} />
            </Elements>
          ) : showSupportStep ? (
            <SupportContributionStep
              serviceAmount={bid.amount}
              onContinue={startCardPayment}
              onCancel={() => setShowSupportStep(false)}
            />
          ) : (
            <>
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("payment.chooseMethod")}
              </p>
              {startError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{startError}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSupportStep(true)}
                  disabled={startingCardPayment || saving !== null}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t("payment.method.card")}
                </button>
                <button
                  type="button"
                  onClick={chooseCash}
                  disabled={saving !== null || startingCardPayment}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {saving === "cash" ? t("adDetail.sending") : t("payment.method.cash")}
                </button>
              </div>
              {bid.paymentMethod && (
                <button
                  type="button"
                  onClick={() => setChangingMethod(false)}
                  className="mt-3 text-sm text-gray-500 hover:underline dark:text-gray-400"
                >
                  {t("common.cancel")}
                </button>
              )}
            </>
          )
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("payment.waitingForPayer")}</p>
        )}
      </div>

      {!isPayer && bidId && <RecipientBankDetails bidId={bidId} />}

      <Link
        to={`/ads/${adId}`}
        className="mt-4 inline-block text-sm text-[#5fac5e] hover:underline"
      >
        {t("payment.backToAd")}
      </Link>
    </div>
  );
}
