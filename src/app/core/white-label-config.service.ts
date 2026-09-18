import { Injectable, signal } from '@angular/core';

export interface WhiteLabelItemAppearance {
  surfaceColor: string; headerColor: string; borderColor: string;
  titleColor: string; textColor: string; mutedTextColor: string; accentColor: string;
  buttonBackgroundColor?: string; buttonTextColor?: string; buttonBorderColor?: string; buttonHoverBackgroundColor?: string;
  height: number; radius: number;
}
export interface WhiteLabelItem { id:string; label:string; template:string; enabled:boolean; appearance:WhiteLabelItemAppearance; }
export interface WhiteLabelSection { id:string; kind:string; label:string; columns:number; expanded?:boolean; items:WhiteLabelItem[]; }

const STORAGE_KEY='qai-white-label-page-layout';
const DEFAULT_APPEARANCE:WhiteLabelItemAppearance={surfaceColor:'#ffffff',headerColor:'#ffffff',borderColor:'#e7ebf0',titleColor:'#202124',textColor:'#26364d',mutedTextColor:'#667085',accentColor:'#f97316',buttonBackgroundColor:'#f97316',buttonTextColor:'#ffffff',buttonBorderColor:'#f97316',buttonHoverBackgroundColor:'#ea580c',height:0,radius:12};

@Injectable({providedIn:'root'})
export class WhiteLabelConfigService {
  readonly layout=signal<WhiteLabelSection[]>([]);
  constructor(){this.load();}
  load():WhiteLabelSection[]{
    try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){const value=JSON.parse(raw); if(Array.isArray(value)){const normalized=this.normalize(value); this.layout.set(normalized); this.apply(normalized); return normalized;}} } catch {}
    this.apply([]); return [];
  }
  save(sections:WhiteLabelSection[]):void { const normalized=this.normalize(sections); localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized)); this.layout.set(normalized); this.apply(normalized); }
  apply(sections=this.layout()):void {
    const root=document.documentElement;
    const header=this.firstEnabled(sections,'header')?.appearance||DEFAULT_APPEARANCE;
    const card=this.firstEnabled(sections,'cards')?.appearance||DEFAULT_APPEARANCE;
    const buttons=this.enabled(sections,'buttons');
    this.set(root,'--wl-app-surface',card.surfaceColor); this.set(root,'--wl-header-bg',header.headerColor); this.set(root,'--wl-header-border',header.borderColor);
    this.set(root,'--wl-header-title',header.titleColor); this.set(root,'--wl-header-text',header.textColor); this.set(root,'--wl-header-muted',header.mutedTextColor);
    this.set(root,'--wl-card-bg',card.surfaceColor); this.set(root,'--wl-card-header-bg',card.headerColor); this.set(root,'--wl-card-border',card.borderColor);
    this.set(root,'--wl-card-title',card.titleColor); this.set(root,'--wl-card-text',card.textColor); this.set(root,'--wl-card-muted',card.mutedTextColor); this.set(root,'--wl-card-accent',card.accentColor); this.set(root,'--wl-card-radius',(card.radius||12)+'px');
    ['button-01','button-02','button-03','button-04'].forEach((template,index)=>{ const item=buttons.find(x=>x.template===template)||buttons[index]; const a=item?.appearance||DEFAULT_APPEARANCE; const n=index+1; this.set(root,'--wl-button-'+n+'-bg',a.buttonBackgroundColor||a.accentColor); this.set(root,'--wl-button-'+n+'-text',a.buttonTextColor||'#ffffff'); this.set(root,'--wl-button-'+n+'-border',a.buttonBorderColor||a.accentColor); this.set(root,'--wl-button-'+n+'-hover',a.buttonHoverBackgroundColor||this.darken(a.buttonBackgroundColor||a.accentColor)); });
    this.enabled(sections,'kpis').forEach((item,index)=>this.set(root,'--wl-kpi-'+(index+1),item.appearance.accentColor));
    this.set(root,'--wl-ready','1');
  }
  private normalize(sections:any[]):WhiteLabelSection[]{ return sections.map(section=>({...section,items:Array.isArray(section.items)?section.items.map((item:any)=>({...item,appearance:{...DEFAULT_APPEARANCE,...(item.appearance||{})}})):[]})); }
  private enabled(sections:WhiteLabelSection[],kind:string){return sections.find(x=>x.kind===kind)?.items?.filter(x=>x.enabled!==false)||[];}
  private firstEnabled(sections:WhiteLabelSection[],kind:string){return this.enabled(sections,kind)[0];}
  private set(root:HTMLElement,name:string,value:string){root.style.setProperty(name,value);}
  private darken(hex:string){if(!/^#[0-9a-fA-F]{6}$/.test(hex))return '#ea580c';const r=Math.max(0,parseInt(hex.slice(1,3),16)-25),g=Math.max(0,parseInt(hex.slice(3,5),16)-25),b=Math.max(0,parseInt(hex.slice(5,7),16)-25);return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
}