import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private apiUrl = 'https://localhost:7175/api/vote';

  constructor(private http: HttpClient) {}

  setIdeaService(ideaService: any) {
    this.ideaService = ideaService;
  }
  private ideaService: any;

  upvoteIdea(ideaID: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${ideaID}/upvote`, {}).pipe(
      tap((response) => {
        console.log('Upvote response:', response);
        // Don't reload ideas - let component handle scroll position
      }),
    );
  }

  downvoteIdea(ideaID: number | string, commentText: string): Observable<any> {
    const payload = {
      voteType: 'Downvote',
      commentText: commentText,
    };
    return this.http.post(`${this.apiUrl}/${ideaID}/downvote`, payload).pipe(
      tap((response) => {
        console.log('Downvote response:', response);
        // Don't reload ideas - let component handle scroll position
      }),
    );
  }

  removeVote(ideaID: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${ideaID}`).pipe(
      tap((response) => {
        console.log('Remove vote response:', response);
      }),
    );
  }

  getVotesForIdea(ideaID: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${ideaID}`);
  }

  hasUserVoted(ideaID: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${ideaID}/user-vote`);
  }

  // vote(
  //   ideaID: number | string,
  //   userID: number,
  //   voteType: 'Upvote' | 'Downvote',
  // ) {
  //   // Deprecated - use upvoteIdea or downvoteIdea instead
  //   console.log('Vote:', { ideaID, userID, voteType });
  // }
}
