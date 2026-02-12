import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Idea, Comment, Vote, Review } from '../models/model';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IdeaService {
  private ideas$ = new BehaviorSubject<Idea[]>([]);
  private apiUrl = 'https://localhost:7175/api/Idea';

  constructor(private http: HttpClient) {
    // Don't auto-load - let components request fresh data when needed
  }

  loadIdeas(): void {
    console.log('Loading ideas from backend...');
    this.http.get<any[]>(`${this.apiUrl}/all`).subscribe({
      next: (ideas) => {
        console.log('Raw ideas from backend:', ideas);
        // Map backend response to frontend Idea model
        const mappedIdeas = ideas.map((idea) => ({
          ideaID: idea.ideaId || idea.ideaID,
          title: idea.title,
          description: idea.description,
          categoryID: idea.categoryId || idea.categoryID,
          userID: idea.userId || idea.userID,
          authorName:
            idea.submittedByUserName || idea.authorName || idea.userName || '',
          submittedDate: idea.submittedDate || new Date().toISOString(),
          status: idea.status || 'UnderReview',
          category: idea.categoryName || idea.category || '',
          upvotes: idea.upvotes || 0,
          downvotes: idea.downvotes || 0,
        }));
        console.log('Mapped ideas:', mappedIdeas);
        this.ideas$.next(mappedIdeas);
      },
      error: (error) => {
        console.error('Error loading ideas:', error);
        this.ideas$.next([]);
      },
    });
  }

  getAllIdeas(): Observable<Idea[]> {
    return this.ideas$.asObservable();
  }

  getMyIdeas(): Observable<Idea[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-ideas`).pipe(
      tap((ideas) => console.log('My ideas from backend:', ideas)),
      map((ideas) =>
        ideas.map((idea) => ({
          ideaID: idea.ideaId || idea.ideaID,
          title: idea.title,
          description: idea.description,
          categoryID: idea.categoryId || idea.categoryID,
          userID: idea.userId || idea.userID,
          authorName:
            idea.submittedByUserName || idea.authorName || idea.userName || '',
          submittedDate: idea.submittedDate || new Date().toISOString(),
          status: idea.status || 'UnderReview',
          category: idea.categoryName || idea.category || '',
          upvotes: idea.upvotes || 0,
          downvotes: idea.downvotes || 0,
        })),
      ),
    );
  }

  getIdeaById(id: number | string): Idea | undefined {
    return this.ideas$.value.find((i) => i.ideaID === id);
  }

  createIdea(partial: Partial<Idea>): Observable<Idea> {
    const payload = {
      title: partial.title || 'Untitled',
      description: partial.description || '',
      categoryId: partial.categoryID, // Send as GUID string
    };

    console.log('IdeaService - sending payload to backend:', payload);
    console.log(
      'CategoryId type:',
      typeof payload.categoryId,
      'Value:',
      payload.categoryId,
    );

    return this.http.post<any>(`${this.apiUrl}/submit`, payload).pipe(
      tap((response: any) => {
        console.log('Create idea response:', response);
        const newIdea: Idea = {
          ideaID: response.ideaId || response.ideaID,
          title: response.title,
          description: response.description,
          categoryID: response.categoryId || response.categoryID,
          userID: response.userId || response.userID,
          submittedDate: response.submittedDate || new Date().toISOString(),
          status: response.status || 'UnderReview',
          category: response.categoryName || response.category || '',
          upvotes: 0,
          downvotes: 0,
        };
        const ideas = [newIdea, ...this.ideas$.value];
        this.ideas$.next(ideas);
      }),
    );
  }

  addComment(c: Partial<Comment>): Observable<Comment> {
    const ideaId = c.ideaID;
    const payload = {
      text: c.text || '',
    };

    return this.http
      .post<any>(`https://localhost:7175/api/comment/${ideaId}`, payload)
      .pipe(
        tap((response) => {
          console.log('Comment added:', response);
        }),
        tap((response) => {
          const comment: Comment = {
            commentID: response.commentID,
            ideaID: response.ideaID || ideaId!,
            userID: response.userID,
            text: response.text,
            createdDate: response.createdDate,
            userName: response.userName,
          };
          return comment;
        }),
      );
  }

  getCommentsForIdea(ideaID: number | string): Observable<Comment[]> {
    return this.http
      .get<any[]>(`https://localhost:7175/api/comment/${ideaID}`)
      .pipe(
        tap((comments) => {
          console.log('Comments from backend:', comments);
          return comments.map((c) => ({
            commentID: c.commentID,
            ideaID: c.ideaID || ideaID,
            userID: c.userID,
            text: c.text,
            createdDate: c.createdDate,
            userName: c.userName,
          }));
        }),
      );
  }

  updateComment(commentID: number | string, text: string): Observable<any> {
    const payload = { text };
    return this.http.put(
      `https://localhost:7175/api/comment/${commentID}`,
      payload,
    );
  }

  deleteComment(commentID: number | string): Observable<any> {
    return this.http.delete(`https://localhost:7175/api/comment/${commentID}`);
  }

  // Review methods
  submitReview(
    ideaID: number | string,
    feedback: string,
    decision: 'Approve' | 'Reject',
  ): Observable<any> {
    const payload = {
      ideaId: ideaID,
      feedback: feedback,
      decision: decision,
    };
    return this.http
      .post('https://localhost:7175/api/review/submit', payload)
      .pipe(
        tap((response) => {
          console.log('Review submitted:', response);
        }),
      );
  }

  getReviewsForIdea(ideaID: number | string): Observable<Review[]> {
    return this.http
      .get<any[]>(`https://localhost:7175/api/review/idea/${ideaID}`)
      .pipe(
        tap((reviews) => {
          console.log('Reviews from backend:', reviews);
          return reviews.map((r) => ({
            reviewID: r.reviewID,
            ideaID: r.ideaID || ideaID,
            reviewerID: r.reviewerID,
            reviewerName: r.reviewerName,
            feedback: r.feedback,
            decision: r.decision,
            reviewDate: r.reviewDate,
          }));
        }),
      );
  }

  getMyReviews(): Observable<Review[]> {
    return this.http
      .get<any[]>('https://localhost:7175/api/review/manager/my-reviews')
      .pipe(
        tap((reviews) => {
          return reviews.map((r) => ({
            reviewID: r.reviewID,
            ideaID: r.ideaID,
            reviewerID: r.reviewerID,
            reviewerName: r.reviewerName,
            feedback: r.feedback,
            decision: r.decision,
            reviewDate: r.reviewDate,
          }));
        }),
      );
  }

  updateReview(
    reviewID: number | string,
    feedback: string,
    decision: 'Approve' | 'Reject',
  ): Observable<any> {
    const payload = { feedback, decision };
    return this.http.put(
      `https://localhost:7175/api/review/${reviewID}`,
      payload,
    );
  }

  deleteReview(reviewID: number | string): Observable<any> {
    return this.http.delete(`https://localhost:7175/api/review/${reviewID}`);
  }

  addReview(r: Partial<Review>): Review {
    // Deprecated - use submitReview instead
    const review: Review = {
      reviewID: Date.now(),
      ideaID: r.ideaID || 0,
      reviewerID: r.reviewerID || 0,
      reviewerName: r.reviewerName,
      feedback: r.feedback || '',
      decision: r.decision || 'Reject',
      reviewDate: r.reviewDate || new Date().toISOString(),
    };
    return review;
  }

  // Manager methods for reviewing ideas
  getIdeasForReview(): Observable<Idea[]> {
    return this.http.get<any[]>('https://localhost:7175/api/review/ideas').pipe(
      tap((ideas) => console.log('Ideas for review from backend:', ideas)),
      map((ideas) =>
        ideas.map((idea) => ({
          ideaID: idea.ideaId || idea.ideaID,
          title: idea.title,
          description: idea.description,
          categoryID: idea.categoryId || idea.categoryID,
          userID: idea.userId || idea.userID,
          authorName:
            idea.submittedByUserName || idea.authorName || idea.userName || '',
          submittedDate: idea.submittedDate || new Date().toISOString(),
          status: idea.status || 'UnderReview',
          category: idea.categoryName || idea.category || '',
          upvotes: idea.upvotes || 0,
          downvotes: idea.downvotes || 0,
        })),
      ),
    );
  }

  getIdeasByStatus(status: string): Observable<Idea[]> {
    return this.http
      .get<any[]>(`https://localhost:7175/api/review/ideas/status/${status}`)
      .pipe(
        tap((ideas) => console.log(`Ideas with status ${status}:`, ideas)),
        map((ideas) =>
          ideas.map((idea) => ({
            ideaID: idea.ideaId || idea.ideaID,
            title: idea.title,
            description: idea.description,
            categoryID: idea.categoryId || idea.categoryID,
            userID: idea.userId || idea.userID,
            authorName:
              idea.submittedByUserName ||
              idea.authorName ||
              idea.userName ||
              '',
            submittedDate: idea.submittedDate || new Date().toISOString(),
            status: idea.status || 'UnderReview',
            category: idea.categoryName || idea.category || '',
            upvotes: idea.upvotes || 0,
            downvotes: idea.downvotes || 0,
          })),
        ),
      );
  }

  getIdeaWithDetails(ideaID: number | string): Observable<any> {
    return this.http
      .get<any>(`https://localhost:7175/api/review/ideas/${ideaID}`)
      .pipe(
        tap((response) => {
          console.log('Idea with full details:', response);
        }),
      );
  }

  changeIdeaStatus(
    ideaID: number | string,
    status: 'Draft' | 'UnderReview' | 'Approved',
  ): Observable<any> {
    const payload = { status };
    return this.http
      .put(`https://localhost:7175/api/review/ideas/${ideaID}/status`, payload)
      .pipe(
        tap(() => {
          // Update local ideas list
          const ideas = this.ideas$.value.slice();
          const idx = ideas.findIndex((i) => i.ideaID === ideaID);
          if (idx >= 0) {
            ideas[idx] = { ...ideas[idx], status };
            this.ideas$.next(ideas);
          }
        }),
      );
  }

  setIdeaStatus(
    ideaID: number | string,
    status: 'Draft' | 'UnderReview' | 'Approved',
  ) {
    // Deprecated - use changeIdeaStatus instead
    const ideas = this.ideas$.value.slice();
    const idx = ideas.findIndex((i) => i.ideaID === ideaID);
    if (idx >= 0) {
      ideas[idx] = { ...ideas[idx], status };
      this.ideas$.next(ideas);
    }
  }

  // Voting methods
  upvoteIdea(ideaID: number | string): Observable<any> {
    return this.http
      .post(`https://localhost:7175/api/vote/${ideaID}/upvote`, {})
      .pipe(
        tap((response) => {
          console.log('Upvote response:', response);
          // Refresh ideas to get updated vote counts
          this.loadIdeas();
        }),
      );
  }

  downvoteIdea(ideaID: number | string, commentText: string): Observable<any> {
    const payload = {
      voteType: 'Downvote',
      commentText: commentText,
    };
    return this.http
      .post(`https://localhost:7175/api/vote/${ideaID}/downvote`, payload)
      .pipe(
        tap((response) => {
          console.log('Downvote response:', response);
          // Refresh ideas to get updated vote counts
          this.loadIdeas();
        }),
      );
  }

  removeVote(ideaID: number | string): Observable<any> {
    return this.http.delete(`https://localhost:7175/api/vote/${ideaID}`).pipe(
      tap((response) => {
        console.log('Remove vote response:', response);
        // Refresh ideas to get updated vote counts
        this.loadIdeas();
      }),
    );
  }

  getVotesForIdea(ideaID: number | string): Observable<any[]> {
    return this.http.get<any[]>(`https://localhost:7175/api/vote/${ideaID}`);
  }

  vote(
    ideaID: number | string,
    userID: number,
    voteType: 'Upvote' | 'Downvote',
  ) {
    // Deprecated - use upvoteIdea or downvoteIdea instead
    console.log('Vote:', { ideaID, userID, voteType });
  }
}
