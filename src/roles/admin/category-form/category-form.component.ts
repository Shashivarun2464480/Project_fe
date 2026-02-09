import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../models/model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css',
  standalone: true,
})
export class CategoryFormComponent implements OnInit {
  @Input() category: Category | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = {
    name: '',
    description: '',
    isActive: true,
  };

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    if (this.category) {
      this.formData = {
        name: this.category.name,
        description: this.category.description || '',
        isActive: this.category.isActive,
      };
    }
  }

  onSubmit(): void {
    if (!this.formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    if (this.category) {
      // Update existing category
      this.categoryService
        .updateCategory(this.category.categoryID, this.formData)
        .subscribe({
          next: () => {
            this.saved.emit();
          },
          error: (error) => {
            console.error('Error updating category:', error);
            alert('Failed to update category. Please try again.');
          },
        });
    } else {
      // Create new category
      this.categoryService.createCategory(this.formData).subscribe({
        next: () => {
          // alert('Category created successfully!');
          this.saved.emit();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          const errorMsg =
            error.error?.message ||
            error.error ||
            error.message ||
            'Failed to create category. Please try again.';
          alert(`Error: ${errorMsg}`);
        },
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
