import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review.service';
import { Idea, Review } from '../../../models/model';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  @Input() idea!: Idea;
  @Output() feedbackSubmitted = new EventEmitter<void>();

  feedback = '';
  existingReviews: Review[] = [];
  isSubmitting = false;
  isLoading = false;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    if (this.idea) {
      this.loadExistingReviews();
    }
  }

  loadExistingReviews(): void {
    this.isLoading = true;
    this.reviewService.getReviewsForIdea(this.idea.ideaID).subscribe({
      next: (reviews) => {
        this.existingReviews = reviews;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      },
    });
  }

  submitFeedback(): void {
    if (!this.feedback.trim()) {
      alert('Please enter feedback');
      return;
    }

    this.isSubmitting = true;
    this.reviewService
      .submitFeedback(this.idea.ideaID, this.feedback.trim())
      .subscribe({
        next: () => {
          alert('Feedback submitted successfully!');
          this.feedback = '';
          this.isSubmitting = false;
          this.loadExistingReviews();
          this.feedbackSubmitted.emit();
        },
        error: (error) => {
          console.error('Error submitting feedback:', error);
          alert('Failed to submit feedback. Please try again.');
          this.isSubmitting = false;
        },
      });
  }
}
