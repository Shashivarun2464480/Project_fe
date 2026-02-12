import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/model';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
  'Executive',
  'Other',
];

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleBreakdown: {
    employees: number;
    managers: number;
    admins: number;
  };
}

export interface UserDetails extends User {
  ideasSubmitted?: number;
  commentsPosted?: number;
  votesCasted?: number;
  reviewsSubmitted?: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private users$ = new BehaviorSubject<User[]>([]);
  private apiUrl = 'https://localhost:7175/api/usermanagement';

  constructor(private http: HttpClient) {}

  // Backend API Methods

  /**
   * Get all users from backend
   * GET /api/usermanagement/users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      tap((users) => console.log('All users from backend:', users)),
      map((users) =>
        users.map((user) => ({
          userID: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department || 'Other',
          status: user.status as 'Active' | 'Inactive',
        })),
      ),
      tap((users) => this.users$.next(users)),
    );
  }

  /**
   * Get users filtered by role
   * GET /api/usermanagement/users/role/{role}
   */
  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/role/${role}`).pipe(
      tap((users) => console.log(`Users with role ${role}:`, users)),
      map((users) =>
        users.map((user) => ({
          userID: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department || 'Other',
          status: user.status as 'Active' | 'Inactive',
        })),
      ),
    );
  }

  /**
   * Get users filtered by status
   * GET /api/usermanagement/users/status/{status}
   */
  getUsersByStatus(status: 'Active' | 'Inactive'): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/status/${status}`).pipe(
      tap((users) => console.log(`Users with status ${status}:`, users)),
      map((users) =>
        users.map((user) => ({
          userID: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department || 'Other',
          status: user.status as 'Active' | 'Inactive',
        })),
      ),
    );
  }

  /**
   * Get detailed user information by ID
   * GET /api/usermanagement/{userId}
   */
  getUserById(id: number | string): Observable<UserDetails> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap((user) => console.log('User details:', user)),
      map((user) => ({
        userID: user.userId,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        department: user.department || 'Other',
        status: user.status as 'Active' | 'Inactive',
        ideasSubmitted: user.ideasSubmitted || 0,
        commentsPosted: user.commentsPosted || 0,
        votesCasted: user.votesCasted || 0,
        reviewsSubmitted: user.reviewsSubmitted || 0,
      })),
    );
  }

  /**
   * Find user by email
   * GET /api/usermanagement/email/{email}
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`).pipe(
      tap((user) => console.log('User by email:', user)),
      map((user) => ({
        userID: user.userId,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        department: user.department || 'Other',
        status: user.status as 'Active' | 'Inactive',
      })),
    );
  }

  /**
   * Search users by name or email
   * GET /api/usermanagement/search/{term}
   */
  searchUsers(term: string): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search/${term}`).pipe(
      tap((users) => console.log('Search results:', users)),
      map((users) =>
        users.map((user) => ({
          userID: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department || 'Other',
          status: user.status as 'Active' | 'Inactive',
        })),
      ),
    );
  }

  /**
   * Get system statistics
   * GET /api/usermanagement/statistics/summary
   */
  getStatistics(): Observable<UserStatistics> {
    return this.http.get<any>(`${this.apiUrl}/statistics/summary`).pipe(
      tap((stats) => console.log('System statistics:', stats)),
      map((stats) => ({
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        roleBreakdown: {
          employees: stats.roleBreakdown?.employees || 0,
          managers: stats.roleBreakdown?.managers || 0,
          admins: stats.roleBreakdown?.admins || 0,
        },
      })),
    );
  }

  /**
   * Toggle user status (Active <-> Inactive)
   * PUT /api/usermanagement/{userId}/status
   */
  toggleUserStatus(
    userId: number | string,
    newStatus: 'Active' | 'Inactive',
  ): Observable<User> {
    return this.http
      .put<any>(`${this.apiUrl}/${userId}/status`, { status: newStatus })
      .pipe(
        tap((user) => console.log('User status toggled:', user)),
        map((user) => ({
          userID: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department || 'Other',
          status: user.status as 'Active' | 'Inactive',
        })),
        tap(() => {
          // Refresh the local users list
          this.getAllUsers().subscribe();
        }),
      );
  }

  /**
   * Activate a user
   * PUT /api/usermanagement/{userId}/activate
   */
  activateUser(userId: number | string): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/activate`, {}).pipe(
      tap((user) => console.log('User activated:', user)),
      map((user) => ({
        userID: user.userId,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        department: user.department || 'Other',
        status: user.status as 'Active' | 'Inactive',
      })),
      tap(() => {
        // Refresh the local users list
        this.getAllUsers().subscribe();
      }),
    );
  }

  /**
   * Deactivate a user
   * PUT /api/usermanagement/{userId}/deactivate
   */
  deactivateUser(userId: number | string): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/deactivate`, {}).pipe(
      tap((user) => console.log('User deactivated:', user)),
      map((user) => ({
        userID: user.userId,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        department: user.department || 'Other',
        status: user.status as 'Active' | 'Inactive',
      })),
      tap(() => {
        // Refresh the local users list
        this.getAllUsers().subscribe();
      }),
    );
  }

  /**
   * Change user role
   * PUT /api/usermanagement/{userId}/role
   */
  updateUserRole(userId: number | string, newRole: UserRole): Observable<User> {
    return this.http
      .put<any>(`${this.apiUrl}/${userId}/role`, { role: newRole })
      .pipe(
        tap((user) => console.log('User role updated:', user)),
        map((user) => ({
          userID: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department || 'Other',
          status: user.status as 'Active' | 'Inactive',
        })),
        tap(() => {
          // Refresh the local users list
          this.getAllUsers().subscribe();
        }),
      );
  }

  /**
   * Get users by department (frontend filtering from cached data)
   */
  getUsersByDepartment(department: string): User[] {
    return this.users$.value.filter((u) => u.department === department);
  }

  /**
   * Check if email already exists (for validation)
   */
  emailExists(email: string, excludeUserID?: number): boolean {
    return this.users$.value.some(
      (u) => u.email === email && u.userID !== excludeUserID,
    );
  }
}
