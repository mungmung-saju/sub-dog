"use client";

import { useCallback, useEffect, useState } from "react";
import { diffDays, fromISO, nextBillingDate, startOfToday, addDays } from "./dates";

export type SubKind = "trial" | "billing";

export interface Subscription {
  id: string;
  serviceId: string;
  name: string;
  emoji: string;
  kind: SubKind;
  /** trial: 무료체험 종료일 / billing: 기준 결제일 (YYYY-MM-DD) */
  date: string;
  price?: number;
  cancelUrl: string;
  createdAt: number;
}

const KEY = "subscription-dog:v1";

export interface SubView extends Subscription {
  due: Date;
  daysLeft: number;
  alertDate: Date;
}

export function toView(s: Subscription): SubView {
  const today = startOfToday();
  const due = s.kind === "billing" ? nextBillingDate(s.date, today) : fromISO(s.date);
  return { ...s, due, daysLeft: diffDays(due, today), alertDate: addDays(due, -3) };
}

export function useSubscriptions() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* 손상된 데이터는 무시 */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Subscription[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 저장 실패(시크릿 모드 등)해도 세션 내에선 동작 */
    }
  }, []);

  const add = useCallback(
    (s: Omit<Subscription, "id" | "createdAt">) => {
      const item: Subscription = { ...s, id: crypto.randomUUID(), createdAt: Date.now() };
      persist([...items, item]);
    },
    [items, persist],
  );

  const remove = useCallback((id: string) => persist(items.filter((i) => i.id !== id)), [items, persist]);

  const views = items.map(toView).sort((a, b) => a.daysLeft - b.daysLeft);

  return { items, views, add, remove, ready };
}
