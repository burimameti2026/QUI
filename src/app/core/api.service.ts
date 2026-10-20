import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly defaultRequestTimeoutMs = 15000;

  constructor(private readonly http: HttpClient) {}

  get<T>(url: string, timeoutMs = this.defaultRequestTimeoutMs): Observable<T> {
    return this.http.get<T>('/api/' + url).pipe(timeout(timeoutMs));
  }

  post<T>(url: string, body: unknown, timeoutMs = this.defaultRequestTimeoutMs): Observable<T> {
    return this.http.post<T>('/api/' + url, body).pipe(timeout(timeoutMs));
  }

  put<T>(url: string, body: unknown, timeoutMs = this.defaultRequestTimeoutMs): Observable<T> {
    return this.http.put<T>('/api/' + url, body).pipe(timeout(timeoutMs));
  }

  delete<T>(url: string, timeoutMs = this.defaultRequestTimeoutMs): Observable<T> {
    return this.http.delete<T>('/api/' + url).pipe(timeout(timeoutMs));
  }
}
