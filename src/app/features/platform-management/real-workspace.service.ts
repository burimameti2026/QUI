import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

export interface RealWorkspaceUseCase { id:string; name:string; description:string; }
export interface RealWorkspaceProspect { id:string; companyName:string; domain:string; contactName:string; email:string; jobTitle:string; industry:string; country:string; painHypothesis:string; offer:string; }
export interface RealWorkspaceTemplate { id:string; name:string; useCaseId:string; description:string; requiredModules:string[]; prospects:RealWorkspaceProspect[]; }
export interface RealWorkspaceOptions { useCases:RealWorkspaceUseCase[]; templates:RealWorkspaceTemplate[]; }
export interface RealWorkspaceDraft { workspaceId:string; status:string; useCaseId:string; templateId:string; name:string; prospects:RealWorkspaceProspect[]; selectedProspectIds:string[]; updatedAtUtc:string; activatedAtUtc?:string|null; }

@Injectable({providedIn:'root'})
export class RealWorkspaceService {
 constructor(private readonly api:ApiService){}
 options():Observable<RealWorkspaceOptions>{return this.api.get<RealWorkspaceOptions>('real-workspace/options');}
 current():Observable<RealWorkspaceDraft|null>{return this.api.get<RealWorkspaceDraft|null>('real-workspace');}
 prepare(useCaseId:string,templateId:string,name?:string):Observable<RealWorkspaceDraft>{return this.api.post<RealWorkspaceDraft>('real-workspace/prepare',{useCaseId,templateId,name:name||null});}
 save(draft:RealWorkspaceDraft):Observable<RealWorkspaceDraft>{return this.api.put<RealWorkspaceDraft>('real-workspace',{workspaceId:draft.workspaceId,name:draft.name,prospects:draft.prospects,selectedProspectIds:draft.selectedProspectIds});}
 activate(workspaceId:string):Observable<RealWorkspaceDraft>{return this.api.post<RealWorkspaceDraft>('real-workspace/activate',workspaceId);}
}
