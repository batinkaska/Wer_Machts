import { useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { useDateFormatter } from "../../lib/useDateFormatter";
import type { Notification } from "../../types/notification";
import { BellIcon } from "../icons";

function notificationText(t: TFunction, n: Notification): string {
  switch (n.type) {
    case "message":
      return t("notifications.message", { name: n.actorName });
    case "bid_placed":
      return t("notifications.bidPlaced", { name: n.actorName, title: n.adTitle });
    case "bid_accepted":
      return t("notifications.bidAccepted", { title: n.adTitle });
    case "bid_rejected":
      return t("notifications.bidRejected", { title: n.adTitle });
    case "new_follower":
      return t("notifications.newFollower", { name: n.actorName });
    case "verify_phone":
      return t("notifications.verifyPhone");
    default:
      return t("notifications.generic");
  }
}

function notificationPath(n: Notification): string {
  switch (n.type) {
    case "message":
      return `/messages/${n.conversationId}`;
    case "bid_accepted":
      return n.bidId ? `/ads/${n.adId}/payment?bidId=${n.bidId}` : `/ads/${n.adId}`;
    case "bid_placed":
    case "bid_rejected":
      return `/ads/${n.adId}`;
    case "new_follower":
      return `/profile/${n.actorId}`;
    case "verify_phone":
      return "/settings?verifyPhone=1";
    default:
      return "/";
  }
}

export function NotificationBell() {
  const { t } = useTranslation();
  const { formatMessageTime } = useDateFormatter();
  const { firebaseUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(
    firebaseUser?.uid,
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNotificationClick(n: Notification) {
    setOpen(false);
    if (!n.read) markAsRead(n.id);
    navigate(notificationPath(n));
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notifications.title")}
        className="relative flex flex-col items-center gap-0.5 text-white hover:text-white/80"
      >
        <span className="relative">
          <BellIcon className="h-7 w-7 text-[#5fac5e]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </button>
      {open && (
        <div className="fixed inset-x-4 top-16 z-20 rounded border border-gray-200 bg-white text-left shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("notifications.title")}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-[#5fac5e] hover:underline"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t("notifications.empty")}
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`block w-full border-b border-gray-50 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                    n.read
                      ? "text-gray-600 dark:text-gray-400"
                      : "bg-green-50/60 font-medium text-gray-900 dark:bg-green-950/40 dark:text-gray-100"
                  }`}
                >
                  <p>{notificationText(t, n)}</p>
                  <p className="mt-0.5 text-xs font-normal text-gray-400">
                    {formatMessageTime(n.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
