import { addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PhotoIcon } from "../components/icons";
import { ConversationList } from "../components/messaging/ConversationList";
import { MessageInput } from "../components/messaging/MessageInput";
import { MessageThread } from "../components/messaging/MessageThread";
import { ReviewBox } from "../components/reviews/ReviewBox";
import { useAuth } from "../contexts/AuthContext";
import { adsCol, messagesCol, reportsCol, publicProfilesCol } from "../firebase/converters";
import { useConversationSummaries } from "../hooks/useConversationSummaries";
import { useMessages } from "../hooks/useMessages";

interface LocationState {
  adId?: string;
  otherUid?: string;
}

export function MessagesPage() {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { firebaseUser, appUser, toggleBlockUser, hideConversations } = useAuth();
  const { summaries, loading: summariesLoading } = useConversationSummaries(firebaseUser?.uid);
  const { messages, loading: messagesLoading } = useMessages(conversationId, firebaseUser?.uid);

  const hiddenIds = appUser?.hiddenConversationIds ?? [];
  const visibleSummaries = summaries.filter((s) => !hiddenIds.includes(s.conversationId));

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [sendError, setSendError] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setReportOpen(false);
    setReportReason("");
    setReportSubmitted(false);
    setSendError(false);
  }, [conversationId]);

  const active = summaries.find((s) => s.conversationId === conversationId);
  const state = location.state as LocationState | null;
  const adId = active?.adId ?? state?.adId;
  const otherUid = active?.otherUid ?? state?.otherUid;

  const [fallbackAdTitle, setFallbackAdTitle] = useState("");
  const [fallbackAdPhotoUrl, setFallbackAdPhotoUrl] = useState<string | null>(null);
  const [fallbackAdStatus, setFallbackAdStatus] = useState<string | null>(null);
  const [fallbackOtherName, setFallbackOtherName] = useState("");

  useEffect(() => {
    if (active || !adId || !otherUid) return;
    getDoc(doc(adsCol, adId)).then((snap) => {
      if (snap.exists()) {
        setFallbackAdTitle(snap.data().title);
        setFallbackAdPhotoUrl(snap.data().photoUrls?.[0] ?? null);
        setFallbackAdStatus(snap.data().status);
      }
    });
    getDoc(doc(publicProfilesCol, otherUid)).then((snap) => {
      if (snap.exists()) setFallbackOtherName(snap.data().displayName);
    });
  }, [active, adId, otherUid]);

  const adTitle = active?.adTitle || fallbackAdTitle;
  const adPhotoUrl = active?.adPhotoUrl ?? fallbackAdPhotoUrl;
  const adStatus = active?.adStatus ?? fallbackAdStatus;
  const otherName = active?.otherName || fallbackOtherName;
  const isBlocked = !!otherUid && (appUser?.blockedUserIds?.includes(otherUid) ?? false);

  function toggleSelectionMode() {
    setSelectionMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds];
    await hideConversations(ids);
    setSelectionMode(false);
    setSelectedIds(new Set());
    if (conversationId && ids.includes(conversationId)) {
      navigate("/messages");
    }
  }

  async function handleBlockToggle() {
    if (!otherUid) return;
    await toggleBlockUser(otherUid);
    setMoreOpen(false);
  }

  async function handleSubmitUserReport() {
    if (!firebaseUser || !otherUid) return;
    setReportSubmitting(true);
    try {
      await addDoc(reportsCol, {
        reportedUserId: otherUid,
        reporterId: firebaseUser.uid,
        reason: reportReason,
        createdAt: serverTimestamp(),
      } as never);
      setReportSubmitted(true);
    } finally {
      setReportSubmitting(false);
    }
  }

  async function handleSend(text: string) {
    if (!firebaseUser || !conversationId || !adId || !otherUid) return;
    setSendError(false);
    try {
      await addDoc(messagesCol, {
        conversationId,
        adId,
        senderId: firebaseUser.uid,
        recipientId: otherUid,
        participantIds: [firebaseUser.uid, otherUid],
        text,
        createdAt: serverTimestamp(),
        read: false,
      } as never);
      // The message notification (and its email) is created server-side by
      // the onMessageCreated trigger.
    } catch {
      setSendError(true);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex h-[70vh] min-h-[500px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div
          className={`w-full flex-col md:flex md:w-80 md:shrink-0 md:border-r md:border-gray-200 md:dark:border-gray-700 ${
            conversationId ? "hidden" : "flex"
          }`}
        >
          <div className="shrink-0 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
            {selectionMode ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("messages.selectedCount", { count: selectedIds.size })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {t("messages.deleteSelected")}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSelectionMode}
                    className="rounded-full bg-[#5fac5e] px-3 py-1 text-xs font-medium text-white hover:bg-[#4d9a4c]"
                  >
                    {t("messages.exitSelection")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("messages.pageTitle")}</h1>
                {visibleSummaries.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectionMode}
                    className="text-sm font-medium text-[#5fac5e] hover:underline"
                  >
                    {t("messages.select")}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              summaries={visibleSummaries}
              loading={summariesLoading}
              activeId={conversationId}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelected}
            />
          </div>
        </div>

        <div className={`min-w-0 flex-1 flex-col ${conversationId ? "flex" : "hidden md:flex"}`}>
          {!conversationId ? (
            <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500">
              {t("messages.selectConversation")}
            </div>
          ) : !adId || !otherUid ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-gray-500 dark:text-gray-400">
              {t("messages.needsAdContext")}
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <Link to="/messages" className="text-gray-400 md:hidden" aria-label={t("common.back")}>
                  ‹
                </Link>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                  {adPhotoUrl ? (
                    <img src={adPhotoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PhotoIcon className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${otherUid}`}
                    className="block truncate font-medium text-gray-900 hover:underline dark:text-gray-100"
                  >
                    {otherName || "..."}
                  </Link>
                  {adTitle && (
                    <p className="truncate text-xs">
                      {adStatus === "closed" && (
                        <span className="font-semibold text-red-600 dark:text-red-400">{t("messages.adClosed")} · </span>
                      )}
                      <Link to={`/ads/${adId}`} className="text-gray-500 hover:underline dark:text-gray-400">
                        {adTitle}
                      </Link>
                    </p>
                  )}
                </div>
                <div className="relative shrink-0" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen((v) => !v)}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {t("messages.more")}
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-48 rounded border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={handleBlockToggle}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {isBlocked ? t("messages.unblockUser") : t("messages.blockUser")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReportOpen(true);
                          setMoreOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {t("messages.reportUser")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {reportOpen && (
                <div className="shrink-0 border-b border-gray-200 p-3 dark:border-gray-700">
                  {reportSubmitted ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("adDetail.reportSubmitted")}</p>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="user-report-reason">
                        {t("adDetail.reportReasonLabel")}
                      </label>
                      <textarea
                        id="user-report-reason"
                        rows={2}
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSubmitUserReport}
                          disabled={reportSubmitting}
                          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                        >
                          {reportSubmitting ? t("adDetail.sending") : t("adDetail.sendReport")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportOpen(false)}
                          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
                ) : (
                  firebaseUser && (
                    <MessageThread messages={messages} uid={firebaseUser.uid} otherName={otherName} />
                  )
                )}
              </div>

              {!isBlocked && conversationId && otherUid && (
                <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-700">
                  <ReviewBox
                    conversationId={conversationId}
                    adId={adId}
                    revieweeId={otherUid}
                    revieweeName={otherName}
                  />
                </div>
              )}

              <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-700">
                {isBlocked ? (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t("messages.blockedNotice")}</p>
                ) : (
                  <>
                    {sendError && (
                      <p className="mb-2 text-center text-sm text-red-600 dark:text-red-400">{t("messages.sendFailedBlocked")}</p>
                    )}
                    <MessageInput onSend={handleSend} />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
