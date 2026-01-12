import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryFormComponent } from '../category-form.component';
import { Category } from '../../../../models/model';
import { CategoryService } from '../../../../services/category.service';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule, CategoryFormComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
  standalone: true,
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  editingCategory: Category | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  openAddForm(): void {
    this.editingCategory = null;
    this.showForm = true;
  }

  openEditForm(category: Category): void {
    this.editingCategory = category;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCategory = null;
  }

  toggleStatus(category: Category): void {
    this.categoryService.toggleCategoryStatus(category.categoryID);
  }

  deleteCategory(category: Category): void {
    if (
      confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
      )
    ) {
      this.categoryService.deleteCategory(category.categoryID);
    }
  }

  onFormSaved(): void {
    this.closeForm();
  }
}
