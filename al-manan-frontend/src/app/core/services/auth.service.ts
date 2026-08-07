import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('al_manan_user');
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      } catch {
        localStorage.removeItem('al_manan_user');
      }
    }
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, request).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, request).pipe(
      tap(user => {
        // Normalize roles — API may return string or array
        if (user.roles && !Array.isArray(user.roles)) {
          user.roles = [user.roles as any];
        }
        this.setCurrentUser(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('al_manan_user');
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/');
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('al_manan_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.roles?.includes('Admin') ?? false;
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }
}
