import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap, catchError, of } from 'rxjs';
import { Notification, NotificationResponse } from '../models/model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'https://localhost:7175/api/Notification';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private pollingInterval: any = null;
  private readonly POLL_INTERVAL = 10000; // Poll every 10 seconds

  // Observable streams
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.notifications$.pipe(
    map(
      (notifications) =>
        notifications.filter((n) => n.status === 'Unread').length,
    ),
  );

  constructor() {
    this.loadNotifications();
    this.startPolling();
  }

  /**
   * Load notifications from backend API
   * GET /api/Notification - returns all notifications for current user ordered by newest first
   */
  private loadNotifications(): void {
    const currentUser = this.auth.getCurrentUser();
    console.log('[NotificationService] Loading notifications...');
    console.log('[NotificationService] Current user:', currentUser);

    if (!currentUser) {
      console.log('[NotificationService] No user logged in, skipping load');
      return;
    }

    console.log('[NotificationService] Fetching from API:', this.apiUrl);

    this.http.get<NotificationResponse[]>(this.apiUrl).subscribe({
      next: (responses) => {
        console.log(
          '[NotificationService] Backend response received:',
          responses,
        );
        console.log(
          '[NotificationService] Notification count:',
          responses?.length || 0,
        );

        const notifications = this.mapNotifications(responses || []);
        console.log(
          '[NotificationService] Mapped notifications:',
          notifications,
        );

        // Update subject with latest notifications
        this.notificationsSubject.next(notifications);
      },
      error: (error) => {
        console.error(
          '[NotificationService] Error fetching notifications:',
          error,
        );
        console.error('[NotificationService] Error status:', error.status);
        console.error('[NotificationService] Error details:', error.error);
      },
    });
  }

  /**
   * Map backend notification response to frontend model
   */
  private mapNotifications(responses: NotificationResponse[]): Notification[] {
    return responses.map((r) => ({
      notificationID: r.notificationId,
      userID: r.userId,
      type: r.type as 'NewIdea' | 'ReviewDecision' | 'NewComment',
      message: r.message,
      status: r.status as 'Unread' | 'Read',
      createdDate: r.createdDate,
      relatedIdeaID: r.ideaId,
      relatedUserName: r.reviewerName,
      ideaTitle: r.ideaTitle,
      reviewerId: r.reviewerId,
      reviewerName: r.reviewerName,
    }));
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  /**
   * Mark notification as read
   * PUT /api/Notification/{notificationId}/read
   */
  markAsRead(notificationID: string): void {
    this.http
      .put(`${this.apiUrl}/${notificationID}/read`, {})
      .pipe(
        tap(() => {
          // Update local state optimistically
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map((n) =>
            n.notificationID === notificationID
              ? { ...n, status: 'Read' as const }
              : n,
          );
          this.notificationsSubject.next(updated);
        }),
        catchError((error) => {
          console.error('Error marking notification as read:', error);
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Mark all notifications as read
   * PUT /api/Notification/read-all
   */
  markAllAsRead(): void {
    this.http
      .put(`${this.apiUrl}/read-all`, {})
      .pipe(
        tap(() => {
          // Update local state optimistically
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map((n) => ({
            ...n,
            status: 'Read' as const,
          }));
          this.notificationsSubject.next(updated);
        }),
        catchError((error) => {
          console.error('Error marking all notifications as read:', error);
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Get unread count from backend
   * GET /api/Notification/unread-count
   */
  getUnreadCountFromBackend(): Observable<number> {
    return this.http
      .get<{ unreadCount: number }>(`${this.apiUrl}/unread-count`)
      .pipe(
        map((response) => response.unreadCount),
        catchError((error) => {
          console.error('Error getting unread count:', error);
          return of(0);
        }),
      );
  }

  /**
   * Delete notification
   * DELETE /api/Notification/{notificationId}
   */
  deleteNotification(notificationID: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationID}`).pipe(
      tap(() => {
        // Remove from local state
        const notifications = this.notificationsSubject.value;
        const updated = notifications.filter(
          (n) => n.notificationID !== notificationID,
        );
        this.notificationsSubject.next(updated);
      }),
      catchError((error) => {
        console.error('Error deleting notification:', error);
        return of(null);
      }),
    );
  }

  /**
   * Refresh notifications from backend
   */
  refresh(): void {
    this.loadNotifications();
  }

  /**
   * Start polling for new notifications
   */
  private startPolling(): void {
    // Only start polling if user is logged in
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return;

    // Clear any existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll for new notifications every 10 seconds
    this.pollingInterval = setInterval(() => {
      const user = this.auth.getCurrentUser();
      if (user) {
        this.loadNotifications();
      } else {
        this.stopPolling();
      }
    }, this.POLL_INTERVAL);
  }

  /**
   * Stop polling for notifications
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Clear all notifications (local state only)
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
    this.stopPolling();
  }

  /**
   * Debug method - Test API call directly
   */
  testApiCall(): void {
    console.log('=== STARTING NOTIFICATION API TEST ===');

    const currentUser = this.auth.getCurrentUser();
    console.log('Current user:', currentUser);

    if (!currentUser) {
      console.log('No user logged in!');
      return;
    }

    const token = this.auth.getToken();
    console.log('Token length:', token?.length);

    // Make direct API call to see raw response
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        console.log('=== RAW API RESPONSE ===');
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        console.log('Response:', response);

        if (Array.isArray(response)) {
          console.log('Array length:', response.length);
          if (response.length > 0) {
            console.log('First item:', response[0]);
            console.log('First item keys:', Object.keys(response[0]));
          }
        }
        console.log('=== END RAW RESPONSE ===');
      },
      error: (error) => {
        console.log('=== API ERROR ===');
        console.log('Status:', error.status);
        console.log('Status text:', error.statusText);
        console.log('Error:', error.error);
        console.log('Message:', error.message);
        console.log('=== END ERROR ===');
      },
    });
  }
}
