import { Injectable } from '@angular/core';

const PREFIX = 'poll-app';

/**
 * Best-effort JSON wrapper around `window.localStorage`. Every access is guarded so a
 * disabled, full, or corrupt store never breaks the app — reads just fall back to `null`.
 */
@Injectable({ providedIn: 'root' })
export class LocalStore {
  /** Reads and parses `key`, returning `null` when it is missing or unreadable. */
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${PREFIX}:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  /** Serialises `value` under `key`, logging instead of throwing when the write fails. */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
    } catch {
      console.log(`Could not set localStorage key "${key}"`);
    }
  }

  /** Deletes `key`, logging instead of throwing when the removal fails. */
  remove(key: string): void {
    try {
      localStorage.removeItem(`${PREFIX}:${key}`);
    } catch {
      console.log(`Error removing localStorage key "${key}"`);
    }
  }
}
