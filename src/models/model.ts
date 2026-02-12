export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
}

export interface User {
  userID: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: 'Active' | 'Inactive';
}

export interface Idea {
  ideaID: number;
  title: string;
  description: string;
  categoryID: number;
  userID: number;
  authorName?: string;
  submittedDate: string;
  status: 'Draft' | 'UnderReview' | 'Approved';
  category?: string;
  upvotes?: number;
  downvotes?: number;
  Comments?: Comment[];
}
export interface Review {
  reviewID?: number;
  ideaID: number;
  reviewerID: number;
  reviewerName?: string;
  feedback: string;
  decision: 'Approve' | 'Reject';
  reviewDate?: string;
}

export interface Comment {
  commentID: number;
  ideaID: number | string;
  userID: number;
  text: string;
  createdDate: string;
  userName?: string;
}

export interface Vote {
  voteID: number;
  ideaID: number;
  userID: number;
  voteType: 'Upvote' | 'Downvote';
}

export interface Notification {
  notificationID: number;
  userID: number;
  type: 'NewIdea' | 'ReviewDecision' | 'NewComment';
  message: string;
  status: 'Unread' | 'Read';
  createdDate: string;
  relatedIdeaID?: number;
  relatedUserName?: string;
}

export interface Category {
  categoryID: number | string;
  name: string;
  description?: string;
  isActive: boolean;
}
