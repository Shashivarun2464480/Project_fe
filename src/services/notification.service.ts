import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Notification } from '../models/model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private auth = inject(AuthService);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  // Observable streams
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => n.status === 'Unread').length)
  );

  constructor() {
    this.loadMockNotifications();
  }

  private loadMockNotifications(): void {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return;

    const mockNotifications: Notification[] = [
      {
        notificationID: 1,
        userID: currentUser.userID,
        type: 'NewIdea',
        message: 'New idea submitted: "Improve Employee Onboarding Process"',
        status: 'Unread',
        createdDate: new Date().toISOString(),
        relatedIdeaID: 101,
        relatedUserName: 'John Doe'
      },
      {
        notificationID: 2,
        userID: currentUser.userID,
        type: 'ReviewDecision',
        message: 'Your idea "Remote Work Policy Enhancement" has been approved',
        status: 'Unread',
        createdDate: new Date(Date.now() - 3600000).toISOString(),
        relatedIdeaID: 102,
        relatedUserName: 'Manager Smith'
      },
      {
        notificationID: 3,
        userID: currentUser.userID,
        type: 'NewComment',
        message: 'Jane Doe commented on your idea "Office Space Redesign"',
        status: 'Read',
        createdDate: new Date(Date.now() - 7200000).toISOString(),
        relatedIdeaID: 103,
        relatedUserName: 'Jane Doe'
      },
      {
        notificationID: 4,
        userID: currentUser.userID,
        type: 'NewComment',
        message: 'New comment on "Team Building Activities"',
        status: 'Read',
        createdDate: new Date(Date.now() - 86400000).toISOString(),
        relatedIdeaID: 104,
        relatedUserName: 'Admin User'
      }
    ];

    this.notificationsSubject.next(mockNotifications);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  markAsRead(notificationID: number): void {
    const notifications = this.notificationsSubject.value;
    const updated = notifications.map(n =>
      n.notificationID === notificationID
        ? { ...n, status: 'Read' as const }
        : n
    );
    this.notificationsSubject.next(updated);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value;
    const updated = notifications.map(n => ({
      ...n,
      status: 'Read' as const
    }));
    this.notificationsSubject.next(updated);
  }

  addNotification(notification: Omit<Notification, 'notificationID'>): void {
    const notifications = this.notificationsSubject.value;
    const newNotification: Notification = {
      ...notification,
      notificationID: Date.now() // Generate simple ID
    };
    this.notificationsSubject.next([newNotification, ...notifications]);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}