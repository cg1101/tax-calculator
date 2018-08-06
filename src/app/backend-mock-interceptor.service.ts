import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TaxRate } from './tax-rate';

const KEY = 'tax_calculator';
const HISTORY_REGEX = /\/users\/(\d+)\/history/;

const VALID_USERS = [
  {
    username: 'testuser',
    password: 'password',
    userId: 12345,
    fullName: 'John Smith',
  },
  {
    username: 'mark.jones',
    password: 'mj123',
    userId: 23456,
    fullName: 'Mark Jones',
  },
];

@Injectable({
  providedIn: 'root'
})
export class BackendMockInterceptor implements HttpInterceptor {

  static getDataStore() {
    console.log('BackendMockInterceptor.getDataStore');
    let store = JSON.parse(localStorage.getItem(KEY));
    if (store === null) {
      store = {
        history: {}
      };
      localStorage.setItem(KEY, store);
    }
    console.log('BackendMockInterceptor.getDataStore is returning', store);
    return store;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // wrap in delayed observable to simulate server api call
    if (request.url === '/login') {
      console.log('trying login');
      const {username, password} = request.body;
      for (let i = 0; i < VALID_USERS.length; i++) {
        const user = VALID_USERS[i];
        console.log('trying user', user);
        if (username === user.username && password === user.password) {
          return of(new HttpResponse({
            status: 200,
            body: {
              ...user
            }
          }));
        }
        console.log('no match, try next');
      }
      return of(new HttpResponse({
        status: 401,
        body: {
          error: 'invalid username or password',
        }
      }));
    } else if (request.url.match(HISTORY_REGEX)) {
      const userId = request.url.match(HISTORY_REGEX)[1];
      const store = BackendMockInterceptor.getDataStore();
      let history;

      if (request.method === 'POST') {
        const data = request.body;
        console.log('store is', store, 'request.body is', data, 'userId is', userId);
        if (store.history[userId] === undefined) {
          store.history[userId] = [];
        }
        data.createdAt = new Date;
        store.history[userId].push(data);
        localStorage.setItem(KEY, JSON.stringify(store));
        return of(new HttpResponse({
          status: 200,
          body: data
        }));
      } else if (request.method === 'GET') {
        history = store.history[userId] || [];
        return of(new HttpResponse({
          status: 200, body: {history}
        }));
      } else if (request.method === 'DELETE') {
        const index = request.params.get('index');
        history = store.history[userId] || [];
        history.splice(index, 1);
        store.history[userId] = history;
        localStorage.setItem(KEY, JSON.stringify(store));
        return of(new HttpResponse({
          status: 200,
          body: {
            message: 'history deleted',
          }
        }));
      }
    } else if (request.url === '/rate') {
      const year = request.params.get('year');
      return of(new HttpResponse({
        status: 200,
        body: {
          rate: <TaxRate>{
            tiers: [
              [0, 18200, 0, 0],
              [18200, 37000, 0.19, 0],
              [37000, 87000, 0.325, 3572],
              [87000, 180000, 0.37, 19822],
              [180000, +Infinity, 0.45, 54232],
            ],
          },
        },
      }));
    } else {
      return next.handle(request);
    }
  }
}
