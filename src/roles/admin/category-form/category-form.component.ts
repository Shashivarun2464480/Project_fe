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
    icon: '📌',
    color: '#6B7280',
    isActive: true,
  };

  availableIcons = [
    '🔄',
    '💡',
    '👥',
    '💻',
    '💰',
    '🎯',
    '📢',
    '⚙️',
    '📌',
    '🚀',
    '📊',
    '🎨',
    '🔧',
    '📝',
    '⭐',
    '🏆',
  ];

  availableColors = [
    '#3B82F6',
    '#F59E0B',
    '#10B981',
    '#8B5CF6',
    '#EF4444',
    '#EC4899',
    '#F97316',
    '#6366F1',
    '#6B7280',
    '#14B8A6',
    '#F43F5E',
    '#84CC16',
  ];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    if (this.category) {
      this.formData = {
        name: this.category.name,
        description: this.category.description || '',
        icon: this.category.icon || '📌',
        color: this.category.color || '#6B7280',
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
      this.categoryService.updateCategory(this.category.categoryID, this.formData);
    } else {
      // Create new category
      this.categoryService.createCategory(this.formData);
    }

    this.saved.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
