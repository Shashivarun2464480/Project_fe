import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('authToken');
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }

  // Clone the request and add authorization header if token exists
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
