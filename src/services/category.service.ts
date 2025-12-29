import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category} from '../models/model';

const CATEGORIES_KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories$ = new BehaviorSubject<Category[]>(this.readCategories());

  constructor() {
    this.seedDefaultCategories();
  }

  private safeRead<T>(key: string): T[] {
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.getItem === 'function'
      ) {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      }
    } catch { }
    return [];
  }

  private safeWrite<T>(key: string, data: T[]) {
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage &&
        typeof window.localStorage.setItem === 'function'
      ) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch { }
  }

  private readCategories(): Category[] {
    return this.safeRead<Category>(CATEGORIES_KEY);
  }

  getAllCategories(): Observable<Category[]> {
    return this.categories$.asObservable();
  }

  getActiveCategories(): Category[] {
    return this.categories$.value.filter((c) => c.isActive);
  }

  getCategoryById(id: number): Category | undefined {
    return this.categories$.value.find((c) => c.categoryID === id);
  }

  createCategory(partial: Partial<Category>): Category {
    const categories = this.categories$.value.slice();
    const nextId = categories.length
      ? Math.max(...categories.map((c) => c.categoryID)) + 1
      : 1;

    const newCategory: Category = {
      categoryID: nextId,
      name: partial.name || 'Untitled Category',
      description: partial.description || '',
      icon: partial.icon || '📌',
      color: partial.color || '#6B7280',
      isActive: partial.isActive !== undefined ? partial.isActive : true,
      createdDate: new Date().toISOString(),
    };

    categories.push(newCategory);
    this.categories$.next(categories);
    this.safeWrite<Category>(CATEGORIES_KEY, categories);
    return newCategory;
  }

  updateCategory(id: number, updates: Partial<Category>): void {
    const categories = this.categories$.value.slice();
    const idx = categories.findIndex((c) => c.categoryID === id);

    if (idx >= 0) {
      categories[idx] = { ...categories[idx], ...updates };
      this.categories$.next(categories);
      this.safeWrite<Category>(CATEGORIES_KEY, categories);
    }
  }

  deleteCategory(id: number): void {
    const categories = this.categories$.value.filter(
      (c) => c.categoryID !== id
    );
    this.categories$.next(categories);
    this.safeWrite<Category>(CATEGORIES_KEY, categories);
  }

  toggleCategoryStatus(id: number): void {
    const category = this.getCategoryById(id);
    if (category) {
      this.updateCategory(id, { isActive: !category.isActive });
    }
  }

  seedDefaultCategories(): void {
    const existing = this.categories$.value;
    if (existing.length === 0) {
      const defaultCategories = [
        {
          name: 'Process Improvement',
          description: 'Ideas to improve existing processes and workflows',
          icon: '🔄',
          color: '#3B82F6',
        },
        {
          name: 'Product Innovation',
          description: 'New product ideas and innovative solutions',
          icon: '💡',
          color: '#F59E0B',
        },
        {
          name: 'Customer Experience',
          description: 'Enhance customer satisfaction and engagement',
          icon: '👥',
          color: '#10B981',
        },
        {
          name: 'Technology',
          description: 'Technology innovations and digital transformation',
          icon: '💻',
          color: '#8B5CF6',
        },
        {
          name: 'Cost Reduction',
          description: 'Ideas to reduce costs and optimize resources',
          icon: '💰',
          color: '#EF4444',
        },
        {
          name: 'HR & Culture',
          description: 'Human resources and workplace culture improvements',
          icon: '🎯',
          color: '#EC4899',
        },
        {
          name: 'Marketing',
          description: 'Marketing strategies and promotional ideas',
          icon: '📢',
          color: '#F97316',
        },
        {
          name: 'Operations',
          description: 'Operational efficiency and process optimization',
          icon: '⚙️',
          color: '#6366F1',
        },
        {
          name: 'Other',
          description: 'Miscellaneous ideas that don\'t fit other categories',
          icon: '📌',
          color: '#6B7280',
        },
      ];

      defaultCategories.forEach((cat) => this.createCategory(cat));
    }
  }
}
