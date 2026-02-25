import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Review, Idea } from '../models/model';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private reviewApiUrl = 'https://localhost:7175/api/review';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/review/ideas
   * Get all ideas for review (Manager role required)
   */
  getIdeasForReview(): Observable<Idea[]> {
    return this.http.get<any[]>(`${this.reviewApiUrl}/ideas`).pipe(
      tap((ideas) => console.log('Ideas for review from backend:', ideas)),
      map((ideas) => ideas.map((idea) => this.mapApiIdeaToLocal(idea))),
    );
  }

  /**
   * GET /api/review/ideas/status/{status}
   * Get ideas filtered by status (Manager role required)
   */
  getIdeasByStatus(
    status: 'Rejected' | 'UnderReview' | 'Approved',
  ): Observable<Idea[]> {
    return this.http
      .get<any[]>(`${this.reviewApiUrl}/ideas/status/${status}`)
      .pipe(
        tap((ideas) => console.log(`Ideas with status ${status}:`, ideas)),
        map((ideas) => ideas.map((idea) => this.mapApiIdeaToLocal(idea))),
      );
  }

  /**
   * GET /api/review/ideas/{ideaId}
   * Get single idea with full details (Manager role required)
   */
  getIdeaWithDetails(ideaID: string | number): Observable<Idea> {
    return this.http.get<any>(`${this.reviewApiUrl}/ideas/${ideaID}`).pipe(
      tap((response) => {
        console.log('Idea with full details:', response);
      }),
      map((idea) => this.mapApiIdeaToLocal(idea)),
    );
  }

  /**
   * POST /api/review/feedback/{ideaId}
   * Submit feedback on an idea (Manager role required)
   */
  submitFeedback(ideaID: string | number, feedback: string): Observable<any> {
    const payload = { feedback };
    return this.http
      .post(`${this.reviewApiUrl}/feedback/${ideaID}`, payload)
      .pipe(
        tap((response) => {
          console.log('Feedback submitted:', response);
        }),
      );
  }

  /**
   * PUT /api/review/ideas/{ideaId}/status
   * Change idea status (Approve/Reject) - Manager role required
   * When rejecting, reviewComment is MANDATORY
   */
  changeIdeaStatus(
    ideaID: string | number,
    status: 'Rejected' | 'UnderReview' | 'Approved',
    reviewComment?: string,
  ): Observable<any> {
    const payload: any = { status };
    if (status === 'Rejected' && reviewComment) {
      payload.reviewComment = reviewComment;
    }
    return this.http
      .put(`${this.reviewApiUrl}/ideas/${ideaID}/status`, payload)
      .pipe(
        tap((response) => {
          console.log(`Idea status changed to ${status}:`, response);
        }),
      );
  }

  /**
   * GET /api/review/{id}
   * Get review by ID (No authorization required)
   */
  getReviewById(reviewId: string | number): Observable<Review> {
    return this.http.get<any>(`${this.reviewApiUrl}/${reviewId}`).pipe(
      // tap((review) => {
      //   console.log('Review details:', review);
      // }),
      map((review) => this.mapApiReviewToLocal(review)),
    );
  }

  /**
   * GET /api/review/idea/{ideaId}
   * Get all reviews for an idea (No authorization required)
   */
  getReviewsForIdea(ideaID: string | number): Observable<Review[]> {
    return this.http.get<any[]>(`${this.reviewApiUrl}/idea/${ideaID}`).pipe(
      // tap((reviews) => {
      // }),
      map((reviews) => reviews.map((r) => this.mapApiReviewToLocal(r))),
    );
  }

  /**
   * GET /api/review/manager/my-reviews
   * Get all reviews submitted by the current manager
   */
  getMyReviews(): Observable<Review[]> {
    return this.http.get<any[]>(`${this.reviewApiUrl}/manager/my-reviews`).pipe(
      tap((reviews) => {
        console.log('My reviews:', reviews);
      }),
      map((reviews) => reviews.map((r) => this.mapApiReviewToLocal(r))),
    );
  }

  /**
   * Helper method to map API idea response to local Idea model
   */
  private mapApiIdeaToLocal(idea: any): Idea {
    return {
      ideaID: idea.ideaId || idea.ideaID,
      title: idea.title,
      description: idea.description,
      categoryID: idea.categoryId || idea.categoryID,
      userID: idea.submittedByUserId || idea.userId || idea.userID,
      authorName:
        idea.submittedByUserName || idea.authorName || idea.userName || '',
      submittedDate: idea.submittedDate || new Date().toISOString(),
      status: idea.status || 'UnderReview',
      category: idea.categoryName || idea.category || '',
      upvotes: idea.upvotes || 0,
      downvotes: idea.downvotes || 0,
      reviewedByID: idea.reviewedByUserId || idea.reviewedByID,
      reviewedByName: idea.reviewedByUserName || idea.reviewedByName,
      reviewComment: idea.reviewComment,
      Comments: idea.comments || [],
      reviews: (idea.reviews || []).map((r: any) =>
        this.mapApiReviewToLocal(r),
      ),
    };
  }

  /**
   * Helper method to map API review response to local Review model
   */
  private mapApiReviewToLocal(review: any): Review {
    return {
      reviewID: review.reviewId || review.reviewID,
      ideaID: review.ideaId || review.ideaID,
      reviewerID: review.reviewerId || review.reviewerID,
      reviewerName: review.reviewerName,
      feedback: review.feedback,
      reviewDate: review.reviewDate,
    };
  }

  // Deprecated methods - kept for backward compatibility
  updateReview(
    reviewID: number | string,
    feedback: string,
    decision: 'Approve' | 'Reject',
  ): Observable<any> {
    const payload = { feedback, decision };
    return this.http.put(`${this.reviewApiUrl}/${reviewID}`, payload);
  }

  deleteReview(reviewID: number | string): Observable<any> {
    return this.http.delete(`${this.reviewApiUrl}/${reviewID}`);
  }

  addReview(r: Partial<Review>): Review {
    // Deprecated - use submitFeedback and changeIdeaStatus instead
    const review: Review = {
      reviewID: Date.now(),
      ideaID: r.ideaID || 0,
      reviewerID: r.reviewerID || 0,
      reviewerName: r.reviewerName,
      feedback: r.feedback || '',
      reviewDate: r.reviewDate || new Date().toISOString(),
    };
    return review;
  }

  // Legacy methods - these should not be used
  submitReview(
    ideaID: number | string,
    feedback: string,

  ): Observable<any> {
    return this.submitFeedback(ideaID, feedback);
  }

  approveIdea(ideaID: number | string): Observable<any> {
    return this.changeIdeaStatus(ideaID, 'Approved');
  }

  rejectIdea(ideaID: number | string, reason: string): Observable<any> {
    return this.changeIdeaStatus(ideaID, 'Rejected', reason);
  }

  setIdeaStatus(
    ideaID: number | string,
    status: 'Rejected' | 'UnderReview' | 'Approved',
  ) {
    return this.changeIdeaStatus(ideaID, status);
  }

  // Legacy methods for idea retrieval with extra info (included for compatibility)
  getIdeaWithReviewerInfo(ideaID: number | string): Observable<any> {
    return this.http.get<any>(`${this.reviewApiUrl}/ideas/${ideaID}`).pipe(
      tap((response) => {
        // console.log('Idea with reviewer info - Raw response:', response);
      }),
      map((idea) => {
        const mapped = {
          ...idea,
          ideaID: idea.ideaId || idea.ideaID,
          reviewedByID: idea.reviewedByUserId || idea.reviewedByID,
          reviewedByName: idea.reviewedByUserName || idea.reviewedByName,
        };
        return mapped;
      }),
    );
  }
}
