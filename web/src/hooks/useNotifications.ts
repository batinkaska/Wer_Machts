import { doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { notificationsCol } from "../firebase/converters";
import type { Notification } from "../types/notification";

export function useNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      notificationsCol,
      where("recipientId", "==", uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setNotifications(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, [uid]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  async function markAsRead(notificationId: string) {
    await updateDoc(doc(notificationsCol, notificationId), { read: true });
  }

  async function markAllAsRead() {
    await Promise.all(
      notifications.filter((n) => !n.read).map((n) => updateDoc(doc(notificationsCol, n.id), { read: true })),
    );
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
