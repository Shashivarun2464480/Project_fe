import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UserRole, Notification } from '../../models/model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);


  dropdownOpen = signal(false);
  notificationDropdownOpen = signal(false);
  isLoggedIn = signal(false);
  userName = signal<string | undefined>(undefined);
  userRole = signal<UserRole | null>(null);
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);


  userInitial = computed(() => {
    const name = this.userName();
    if (!name || !name.trim()) return '?';
    return name.trim().charAt(0).toUpperCase();
  });

  isManager = computed(() => this.userRole() === UserRole.MANAGER);
  isAdmin = computed(() => this.userRole() === UserRole.ADMIN);
  isEmployee = computed(() => this.userRole() === UserRole.EMPLOYEE);

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.auth.user$.subscribe((u) => {
        this.isLoggedIn.set(!!u);
        this.userName.set(u?.name);
        this.userRole.set(u?.role || null);
      })
    );

    // Subscribe to notifications
    this.subs.push(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications.set(notifications);
      })
    );

    // Subscribe to unread count
    this.subs.push(
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadCount.set(count);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
    this.notificationDropdownOpen.set(false);
  }

  toggleNotificationDropdown(): void {
    this.notificationDropdownOpen.set(!this.notificationDropdownOpen());
    if (this.notificationDropdownOpen()) {
      this.dropdownOpen.set(false); // Close user dropdown
    }
  }

  closeNotificationDropdown(): void {
    this.notificationDropdownOpen.set(false);
  }

  markAsRead(notificationID: number): void {
    this.notificationService.markAsRead(notificationID);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'NewIdea':
        return '💡';
      case 'ReviewDecision':
        return '✅';
      case 'NewComment':
        return '💬';
      default:
        return '🔔';
    }
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  async logout(): Promise<void> {
    this.auth.logout();
    this.closeDropdown();
    await this.router.navigateByUrl('/');
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeDropdown();
    this.closeNotificationDropdown();
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const inDropdown = target.closest('[data-dropdown-root]');
    const inNotificationDropdown = target.closest('[data-notification-dropdown]');
    if (!inDropdown) this.closeDropdown();
    if (!inNotificationDropdown) this.closeNotificationDropdown();
  }
};