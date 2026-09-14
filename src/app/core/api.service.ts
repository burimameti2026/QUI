import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

@Injectable({providedIn:'root'})
export class ApiService {
  private readonly requestTimeoutMs = 15000;

  constructor(private http: HttpClient) {}

  get<T>(u: string): Observable<T> {
    return this.http.get<T>('/api/' + u).pipe(timeout(this.requestTimeoutMs));
  }

  post<T>(u: string, b: any): Observable<T> {
    return this.http.post<T>('/api/' + u, b).pipe(timeout(this.requestTimeoutMs));
  }

  put<T>(u: string, b: any): Observable<T> {
    return this.http.put<T>('/api/' + u, b).pipe(timeout(this.requestTimeoutMs));
  }

  delete<T>(u: string): Observable<T> {
    return this.http.delete<T>('/api/' + u).pipe(timeout(this.requestTimeoutMs));
  }
}
