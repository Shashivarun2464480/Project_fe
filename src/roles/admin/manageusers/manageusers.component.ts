import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserRole } from '../../../models/model';
import {
  UserService,
  UserStatistics,
  UserDetails,
} from '../../../services/user.service';

@Component({
  selector: 'app-manageusers',
  imports: [CommonModule, FormsModule],
  templateUrl: './manageusers.component.html',
  styleUrl: './manageusers.component.css',
  standalone: true,
})
export class ManageusersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  statistics: UserStatistics | null = null;
  isLoading = false;
  selectedUser: UserDetails | null = null;
  showUserDetails = false;

  // Filter options
  filterRole: UserRole | 'All' = 'All';
  filterStatus: 'Active' | 'Inactive' | 'All' = 'All';
  searchTerm = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStatistics();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });
  }

  loadStatistics(): void {
    this.userService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filter by role
    if (this.filterRole !== 'All') {
      filtered = filtered.filter((u) => u.role === this.filterRole);
    }

    // Filter by status
    if (this.filterStatus !== 'All') {
      filtered = filtered.filter((u) => u.status === this.filterStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }

    this.filteredUsers = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    if (this.searchTerm.trim().length >= 2) {
      this.userService.searchUsers(this.searchTerm).subscribe({
        next: (users) => {
          this.filteredUsers = users;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.applyFilters(); // Fallback to local filtering
        },
      });
    } else {
      this.applyFilters();
    }
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';

    if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
      this.userService.toggleUserStatus(user.userID, newStatus).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          if (
            error.status === 400 &&
            error.error?.message?.includes('deactivate your own')
          ) {
            alert('You cannot deactivate your own account!');
          } else {
            alert('Failed to update user status. Please try again.');
          }
        },
      });
    }
  }

  activateUser(user: User): void {
    this.userService.activateUser(user.userID).subscribe({
      next: () => {
        this.loadUsers();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error activating user:', error);
        alert('Failed to activate user. Please try again.');
      },
    });
  }

  deactivateUser(user: User): void {
    if (confirm(`Are you sure you want to deactivate "${user.name}"?`)) {
      this.userService.deactivateUser(user.userID).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error deactivating user:', error);
          if (
            error.status === 400 &&
            error.error?.message?.includes('deactivate your own')
          ) {
            alert('You cannot deactivate your own account!');
          } else {
            alert('Failed to deactivate user. Please try again.');
          }
        },
      });
    }
  }

  viewUserDetails(user: User): void {
    this.userService.getUserById(user.userID).subscribe({
      next: (details) => {
        this.selectedUser = details;
        this.showUserDetails = true;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        alert('Failed to load user details. Please try again.');
      },
    });
  }

  closeUserDetails(): void {
    this.showUserDetails = false;
    this.selectedUser = null;
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-900';
      case UserRole.MANAGER:
        return 'bg-blue-100 text-blue-900';
      case UserRole.EMPLOYEE:
        return 'bg-green-100 text-green-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  }

  getStatusClass(status: 'Active' | 'Inactive'): string {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }
}
