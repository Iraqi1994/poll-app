import { Injectable } from '@angular/core';

const PREFIX = 'poll-app';

/**
 * Best-effort JSON wrapper around `window.localStorage`. Every access is guarded so a
 * disabled, full, or corrupt store never breaks the app — reads just fall back to `null`.
 */
@Injectable({ providedIn: 'root' })
export class LocalStore {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${PREFIX}:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
    } catch {
      console.log(`Could not set localStorage key "${key}"`);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(`${PREFIX}:${key}`);
    } catch {
      console.log(`Error removing localStorage key "${key}"`);
    }
  }
}
