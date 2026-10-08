"use client";

import { useCallback, useSyncExternalStore } from "react";

/** 즐겨찾기는 서버로 보내지 않고 이 브라우저의 localStorage에만 slug 배열로 저장한다. */
const STORAGE_KEY = "free-traveler:favorites";
const CHANGE_EVENT = "free-traveler:favorites-change";

const EMPTY: readonly string[] = [];
let cachedRaw: string | null = null;
let cachedValue: readonly string[] = EMPTY;

function parse(raw: string | null): readonly string[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    const slugs = value.filter((v): v is string => typeof v === "string");
    return [...new Set(slugs)];
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(slugs: readonly string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 조용히 무시한다.
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const add = useCallback((slug: string) => {
    const current = getSnapshot();
    if (!current.includes(slug)) write([...current, slug]);
  }, []);

  const remove = useCallback((slug: string) => {
    const current = getSnapshot();
    if (current.includes(slug)) write(current.filter((s) => s !== slug));
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      if (getSnapshot().includes(slug)) remove(slug);
      else add(slug);
    },
    [add, remove],
  );

  return { favorites, isFavorite, add, remove, toggle };
}
