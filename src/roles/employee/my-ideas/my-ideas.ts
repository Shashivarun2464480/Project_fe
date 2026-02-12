import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IdeaService } from '../../../services/idea.service';
import { AuthService } from '../../../services/auth.service';
import {
  Idea,
  Comment as IdeaComment,
  Review,
  User,
} from '../../../models/model';

@Component({
  selector: 'app-my-ideas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-ideas.html',
  styleUrl: './my-ideas.css',
})
export class MyIdeas implements OnInit {
  ideas: Idea[] = [];
  filterStatus: 'All' | 'Draft' | 'UnderReview' | 'Approved' | 'Rejected' =
    'All';

  selected: Idea | null = null;
  comments: IdeaComment[] = [];
  reviews: Review[] = [];
  newComment = '';
  currentUser: User | null = null;
  isLoading = true;

  get filteredIdeas(): Idea[] {
    if (this.filterStatus === 'All') {
      return this.ideas;
    }
    return this.ideas.filter((idea) => idea.status === this.filterStatus);
  }

  constructor(
    private ideaService: IdeaService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadMyIdeas();
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
  }

  loadMyIdeas() {
    this.isLoading = true;
    this.ideaService.getMyIdeas().subscribe({
      next: (ideas) => {
        this.ideas = ideas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading my ideas:', error);
        this.isLoading = false;
      },
    });
  }

  selectIdea(idea: Idea) {
    this.selected = idea;
    // Load comments from backend
    this.ideaService.getCommentsForIdea(idea.ideaID).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.comments = [];
      },
    });
    this.ideaService.getReviewsForIdea(idea.ideaID).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviews = [];
      },
    });
  }

  addComment() {
    if (!this.selected || !this.currentUser || !this.newComment.trim()) return;

    this.ideaService
      .addComment({
        ideaID: this.selected.ideaID,
        userID: this.currentUser.userID,
        text: this.newComment.trim(),
        userName: this.currentUser.name,
      })
      .subscribe({
        next: (comment) => {
          this.newComment = '';
          // Reload comments
          this.ideaService.getCommentsForIdea(this.selected!.ideaID).subscribe({
            next: (comments) => {
              this.comments = comments;
            },
          });
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          alert('Failed to add comment. Please try again.');
        },
      });
  }

  upvote(idea: Idea) {
    if (!this.currentUser) return;

    this.ideaService.upvoteIdea(idea.ideaID).subscribe({
      next: (response) => {
        console.log('Upvoted successfully');
        // Reload my ideas to get updated vote counts
        this.loadMyIdeas();
      },
      error: (error) => {
        console.error('Error upvoting:', error);
        const errorMsg =
          error.error?.message || error.error || 'Failed to upvote';
        alert(errorMsg);
      },
    });
  }

  downvote(idea: Idea) {
    if (!this.currentUser) return;

    // Prompt for comment (mandatory for downvote)
    const comment = prompt(
      'Please provide a reason for your downvote (mandatory):',
    );

    if (comment === null) {
      // User cancelled
      return;
    }

    if (!comment || comment.trim() === '') {
      alert(
        'Comment is mandatory when downvoting. Please provide a reason for your downvote.',
      );
      return;
    }

    this.ideaService.downvoteIdea(idea.ideaID, comment.trim()).subscribe({
      next: (response) => {
        console.log('Downvoted successfully with comment');
        // Reload my ideas to get updated vote counts
        this.loadMyIdeas();
      },
      error: (error) => {
        console.error('Error downvoting:', error);
        const errorMsg =
          error.error?.message || error.error || 'Failed to downvote';
        alert(errorMsg);
      },
    });
  }
}
