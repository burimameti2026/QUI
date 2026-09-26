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

  provisionForCampaign<T = any>(id: string, scenarioCode: string | undefined, icpProfileId: string): Observable<T> { return this.api.post<T>(`industry-packs/${id}/provision`, { scenarioCode, icpProfileId }); }

  install<T = any>(id: string): Observable<T> {
    return this.provision<T>(id);
  }

  create<T = any>(input: any): Observable<T> { return this.api.post<T>('industry-packs', input); }
  update<T = any>(id: string, input: any): Observable<T> { return this.api.put<T>(`industry-packs/${id}`, input); }
  buildWithAi<T = any>(prompt: string): Observable<T> { return this.api.post<T>('industry-packs/ai/build', { prompt }); }
}
