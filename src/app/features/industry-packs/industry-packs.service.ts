import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

@Injectable({ providedIn: 'root' })
export class IndustryPacksService {
  constructor(private api: ApiService) {}

  list<T = any>(): Observable<T> {
    return this.api.get<T>('industry-packs');
  }

  provision<T = any>(id: string, scenarioCode?: string): Observable<T> {
    return this.api.post<T>(`industry-packs/${id}/provision`, scenarioCode ? { scenarioCode } : {});
  }

  install<T = any>(id: string): Observable<T> {
    return this.provision<T>(id);
  }
}
