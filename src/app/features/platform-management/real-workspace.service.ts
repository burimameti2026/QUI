import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

export interface RealWorkspaceUseCase { id:string; name:string; description:string; }
export interface RealWorkspaceTemplate { id:string; name:string; useCaseId:string; description:string; requiredModules:string[]; }
export interface RealWorkspaceOptions { useCases:RealWorkspaceUseCase[]; templates:RealWorkspaceTemplate[]; schedule?:string; }
export interface RealWorkspaceRequest { tenantId:string; name?:string|null; useCase?:string|null; templateKey?:string|null; industry?:string|null; region?:string|null; countriesJson?:string|null; dailyDiscoveryLimit?:number; minimumScore?:number; runTimeUtc?:string|null; }
export interface RealWorkspaceResult { tenantId:string; agentId:string; agentName:string; agentStatus:string; initialRunId?:string|null; status:string; targetListId?:string|null; campaignId?:string|null; }

@Injectable({providedIn:'root'})
export class RealWorkspaceService {
 constructor(private readonly api:ApiService){}
 options():Observable<RealWorkspaceOptions>{return this.api.get<RealWorkspaceOptions>('real-workspace/options');}
 prepare(request:RealWorkspaceRequest):Observable<RealWorkspaceResult>{return this.api.post<RealWorkspaceResult>('real-workspace/prepare',request);}
 activate(request:RealWorkspaceRequest):Observable<RealWorkspaceResult>{return this.api.post<RealWorkspaceResult>('real-workspace/activate',request);}
}
