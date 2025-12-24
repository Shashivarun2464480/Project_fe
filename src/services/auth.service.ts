import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../models/model';
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSub = new BehaviorSubject<{
    loggedIn: boolean;
    role: UserRole | null;
    name?: string;
  }>({
    loggedIn: false,
    role: null,
    name: '',
  });
 
  user$ = this.userSub.asObservable();
 
  constructor() {
    try {
      const hasStorage =
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.getItem === 'function';
      if (hasStorage) {
        const raw = window.localStorage.getItem('auth');
        if (raw) {
          try {
            this.userSub.next(JSON.parse(raw));
          } catch {
            try {
              window.localStorage.removeItem('auth');
            } catch {}
          }
        }
      }
    } catch {}
  }
 
  isLoggedIn(): boolean {
    return this.userSub.value.loggedIn;
  }
  getUserRole(): UserRole | null {
    return this.userSub.value.role;
  }
  getUserName(): string | undefined {
    return this.userSub.value.name;
  }
 
  login(role: UserRole, name?: string) {
    const state = { loggedIn: true, role, name: name ?? '' };
    this.userSub.next(state);
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.setItem === 'function'
      ) {
        window.localStorage.setItem('auth', JSON.stringify(state));
      }
    } catch {}
  }
 
  logout() {
    this.userSub.next({ loggedIn: false, role: null, name: '' });
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.removeItem === 'function'
      ) {
        window.localStorage.removeItem('auth');
      }
    } catch {}
  }
}