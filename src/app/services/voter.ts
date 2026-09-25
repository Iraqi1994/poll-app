import { Injectable, inject } from '@angular/core';
import { LocalStore } from './local-store';

const VOTER_KEY = 'voter/id';

@Injectable({ providedIn: 'root' })
export class Voter {
  private readonly storage = inject(LocalStore);

  readonly id = this.loadOrCreateId();

  /**
   * Returns the browser's stored voter id, generating and persisting a new uuid on first use.
   */
  loadOrCreateId(): string {
    const existing = this.storage.get<string>(VOTER_KEY);
    if (existing) {
      return existing;
    }

    const created = crypto.randomUUID();
    this.storage.set(VOTER_KEY, created);
    return created;
  }
}
