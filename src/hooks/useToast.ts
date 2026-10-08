"use client";

import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

/**
 * 참가 요청·신고·URL 저장 결과 같은 알림은 이메일을 보내지 않고 화면 Toast로만 알린다.
 * 상태는 앱 전체에서 하나만 두고, 3초 뒤 자동으로 사라진다.
 */
const AUTO_DISMISS_MS = 3000;
const EMPTY: readonly ToastItem[] = [];

let toasts: readonly ToastItem[] = EMPTY;
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: readonly ToastItem[]): void {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number): void {
  emit(toasts.filter((t) => t.id !== id));
}

export function showToast(
  message: string,
  variant: ToastVariant = "success",
): number {
  const id = nextId++;
  emit([...toasts, { id, message, variant }]);
  setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
  return id;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useToast() {
  const items = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY,
  );
  return { toasts: items, showToast, dismissToast };
}
