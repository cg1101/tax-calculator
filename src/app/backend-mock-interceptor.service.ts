import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendMockInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // wrap in delayed observable to simulate server api call
    if (request.url === '/login') {
      if (request.body.username === 'testuser' && request.body.password === 'password') {
        return of(new HttpResponse({
          status: 200, body: {
            userId: 12345,
            fullName: 'John Smith',
          }
        }));
      } else {
        return of(new HttpResponse({
          status: 401, body: {
            error: 'invalid username or password',
          }
        }));
      }
    } else if (request.url.match(/\/users\/\d+\/history/)) {
      return of(new HttpResponse({
        status: 200, body: {
          history: []
        }
      }));
    }
    else {
      return next.handle(request);
    }
  }
}
