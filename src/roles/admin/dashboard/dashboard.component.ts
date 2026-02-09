import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IdeaService } from '../../../services/idea.service';
import { CategoryService } from '../../../services/category.service';
import { UserRole, Idea, User, Category } from '../../../models/model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
})
export class DashboardComponent implements OnInit {
  // Statistics
  totalUsers = 0;
  totalAdmins = 0;
  totalManagers = 0;
  totalEmployees = 0;

  totalIdeas = 0;
  draftIdeas = 0;
  underReviewIdeas = 0;
  approvedIdeas = 0;

  totalCategories = 0;
  activeCategories = 0;

  approvalRate = 0;

  recentIdeas: Idea[] = [];
  recentUsers: User[] = [];

  constructor(
    private ideaService: IdeaService,
    private userService: UserService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    // Load users
    this.userService.getAllUsers().subscribe((users) => {
      this.totalUsers = users.length;
      this.totalAdmins = users.filter((u) => u.role === UserRole.ADMIN).length;
      this.totalManagers = users.filter((u) => u.role === UserRole.MANAGER).length;
      this.totalEmployees = users.filter((u) => u.role === UserRole.EMPLOYEE).length;

    });

    // Load ideas
    this.ideaService.getAllIdeas().subscribe((ideas) => {
      this.totalIdeas = ideas.length;
      this.draftIdeas = ideas.filter((i) => i.status === 'Rejected').length;
      this.underReviewIdeas = ideas.filter((i) => i.status === 'UnderReview').length;
      this.approvedIdeas = ideas.filter((i) => i.status === 'Approved').length;

      // Calculate approval rate
      if (this.totalIdeas > 0) {
        this.approvalRate = Math.round((this.approvedIdeas / this.totalIdeas) * 100);
      }

      // Get 5 most recent ideas
      this.recentIdeas = ideas
        .sort((a, b) => {
          const dateA = new Date(a.submittedDate).getTime();
          const dateB = new Date(b.submittedDate).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
    });

    // Load categories
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.totalCategories = categories.length;
      this.activeCategories = categories.filter((c) => c.isActive).length;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft':
        return 'status-draft';
      case 'UnderReview':
        return 'status-review';
      case 'Approved':
        return 'status-approved';
      default:
        return '';
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'role-admin';
      case UserRole.MANAGER:
        return 'role-manager';
      case UserRole.EMPLOYEE:
        return 'role-employee';
      default:
        return '';
    }
  }
}
