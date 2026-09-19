import { Injectable, signal } from '@angular/core';

export interface WhiteLabelItemAppearance {
  surfaceColor: string; headerColor: string; borderColor: string;
  titleColor: string; textColor: string; mutedTextColor: string; accentColor: string;
  buttonBackgroundColor?: string; buttonTextColor?: string; buttonBorderColor?: string; buttonHoverBackgroundColor?: string;
  height: number; radius: number;
}
export interface WhiteLabelStyle extends WhiteLabelItemAppearance { }
export interface WhiteLabelStyles { header:WhiteLabelStyle; grid:WhiteLabelStyle; kpis:WhiteLabelStyle; cards:WhiteLabelStyle; buttons:WhiteLabelStyle; text:WhiteLabelStyle; steps:WhiteLabelStyle; lists:WhiteLabelStyle; tables:WhiteLabelStyle; badges:WhiteLabelStyle; forms:WhiteLabelStyle; }
export interface WhiteLabelItem { id:string; label:string; template:string; enabled:boolean; appearance:WhiteLabelItemAppearance; }
export interface WhiteLabelSection { id:string; kind:string; label:string; columns:number; expanded?:boolean; items:WhiteLabelItem[]; }

const STORAGE_KEY='qai-white-label-page-layout-v2';
const STYLE_KEY='qai-white-label-component-styles-v2';
const DEFAULT_APPEARANCE:WhiteLabelItemAppearance={surfaceColor:'#ffffff',headerColor:'#edf4ff',borderColor:'#dbe5f0',titleColor:'#172b4d',textColor:'#26364d',mutedTextColor:'#667085',accentColor:'#2563eb',buttonBackgroundColor:'#2563eb',buttonTextColor:'#ffffff',buttonBorderColor:'#2563eb',buttonHoverBackgroundColor:'#1d4ed8',height:0,radius:12};
const DEFAULT_STYLES:WhiteLabelStyles={header:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:64,radius:0},grid:{...DEFAULT_APPEARANCE,height:0,radius:12},kpis:{...DEFAULT_APPEARANCE,headerColor:'#edf4ff',height:0,radius:12},cards:{...DEFAULT_APPEARANCE,height:0,radius:12},buttons:{...DEFAULT_APPEARANCE,height:40,radius:9},text:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:0},steps:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:12},lists:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:12},tables:{...DEFAULT_APPEARANCE,headerColor:'#f8fafc',height:0,radius:8},badges:{...DEFAULT_APPEARANCE,headerColor:'#edf4ff',height:0,radius:999},forms:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:40,radius:8}};

@Injectable({providedIn:'root'})
export class WhiteLabelConfigService {
  readonly layout=signal<WhiteLabelSection[]>([]);
  readonly styles=signal<WhiteLabelStyles>(this.loadStyles());
  constructor(){this.load();}
  load():WhiteLabelSection[]{
    try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){const value=JSON.parse(raw); if(Array.isArray(value)){const normalized=this.normalize(value); this.layout.set(normalized); this.apply(normalized); return normalized;}} } catch {}
    this.apply([]); return [];
  }
  save(sections:WhiteLabelSection[]):void { const normalized=this.normalize(sections); localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized)); this.layout.set(normalized); this.apply(normalized); }
  loadStyles():WhiteLabelStyles { try { const raw=localStorage.getItem(STYLE_KEY); if(raw){ return this.normalizeStyles(JSON.parse(raw)); } } catch {} return JSON.parse(JSON.stringify(DEFAULT_STYLES)); }
  saveStyles(styles:WhiteLabelStyles):WhiteLabelStyles { const normalized=this.normalizeStyles(JSON.parse(JSON.stringify(styles))); localStorage.setItem(STYLE_KEY,JSON.stringify(normalized)); this.styles.set(normalized); this.apply(this.layout(),normalized); return normalized; }
  apply(sections=this.layout(), styles=this.styles()):void {
    const root=document.documentElement;
    const header=styles.header;
    const card=styles.cards;
    const grid=styles.grid;
    const kpis=styles.kpis;
    const buttonsStyle=styles.buttons;
    const text=styles.text; const steps=styles.steps; const lists=styles.lists; const tables=styles.tables; const badges=styles.badges; const forms=styles.forms;
    const buttons=this.enabled(sections,'buttons');
    this.set(root,'--wl-app-surface',card.surfaceColor); this.set(root,'--wl-surface',card.surfaceColor); this.set(root,'--wl-text',card.textColor); this.set(root,'--wl-muted',card.mutedTextColor); this.set(root,'--wl-border',card.borderColor); this.set(root,'--wl-accent',card.accentColor); this.set(root,'--wl-accent-hover',card.buttonHoverBackgroundColor||this.darken(card.accentColor)); this.set(root,'--wl-accent-soft',card.headerColor); this.set(root,'--wl-grid-gap',(grid.height||12)+'px'); this.set(root,'--wl-header-bg',header.headerColor); this.set(root,'--wl-header-border',header.borderColor);
    this.set(root,'--wl-header-title',header.titleColor); this.set(root,'--wl-header-text',header.textColor); this.set(root,'--wl-header-muted',header.mutedTextColor); this.set(root,'--wl-header-height',(header.height||64)+'px');
    this.set(root,'--wl-card-bg',card.surfaceColor); this.set(root,'--wl-card-header-bg',card.headerColor); this.set(root,'--wl-card-border',card.borderColor);
    this.set(root,'--wl-card-title',card.titleColor); this.set(root,'--wl-card-text',card.textColor); this.set(root,'--wl-card-muted',card.mutedTextColor); this.set(root,'--wl-card-accent',card.accentColor); this.set(root,'--wl-card-radius',(card.radius||12)+'px');
    ['button-01','button-02','button-03','button-04'].forEach((template,index)=>{ const a=buttonsStyle; const n=index+1; this.set(root,'--wl-button-'+n+'-bg',a.buttonBackgroundColor||a.accentColor); this.set(root,'--wl-button-'+n+'-text',a.buttonTextColor||'#ffffff'); this.set(root,'--wl-button-'+n+'-border',a.buttonBorderColor||a.accentColor); this.set(root,'--wl-button-'+n+'-hover',a.buttonHoverBackgroundColor||this.darken(a.buttonBackgroundColor||a.accentColor)); });
    this.set(root,'--wl-kpi-1',kpis.accentColor); this.set(root,'--wl-kpi-2',kpis.accentColor); this.set(root,'--wl-kpi-3',kpis.accentColor); this.set(root,'--wl-kpi-4',kpis.accentColor); this.set(root,'--wl-kpi-5',kpis.accentColor); this.set(root,'--wl-kpi-bg',kpis.surfaceColor); this.set(root,'--wl-kpi-header',kpis.headerColor); this.set(root,'--wl-kpi-border',kpis.borderColor); this.set(root,'--wl-kpi-title',kpis.titleColor); this.set(root,'--wl-kpi-text',kpis.textColor); this.set(root,'--wl-kpi-muted',kpis.mutedTextColor); this.set(root,'--wl-kpi-radius',(kpis.radius||12)+'px'); this.set(root,'--wl-button-global-bg',buttonsStyle.buttonBackgroundColor||buttonsStyle.accentColor); this.set(root,'--wl-button-global-text',buttonsStyle.buttonTextColor||'#fff'); this.set(root,'--wl-button-global-border',buttonsStyle.buttonBorderColor||buttonsStyle.accentColor); this.set(root,'--wl-button-global-hover',buttonsStyle.buttonHoverBackgroundColor||this.darken(buttonsStyle.accentColor)); this.set(root,'--wl-text-surface',text.surfaceColor); this.set(root,'--wl-steps-bg',steps.surfaceColor); this.set(root,'--wl-steps-header',steps.headerColor); this.set(root,'--wl-steps-border',steps.borderColor); this.set(root,'--wl-steps-title',steps.titleColor); this.set(root,'--wl-steps-text',steps.textColor); this.set(root,'--wl-steps-muted',steps.mutedTextColor); this.set(root,'--wl-steps-accent',steps.accentColor); this.set(root,'--wl-steps-radius',(steps.radius||12)+'px'); this.set(root,'--wl-list-bg',lists.surfaceColor); this.set(root,'--wl-list-border',lists.borderColor); this.set(root,'--wl-list-title',lists.titleColor); this.set(root,'--wl-list-text',lists.textColor); this.set(root,'--wl-list-muted',lists.mutedTextColor); this.set(root,'--wl-list-accent',lists.accentColor); this.set(root,'--wl-list-radius',(lists.radius||12)+'px'); this.set(root,'--wl-table-bg',tables.surfaceColor); this.set(root,'--wl-table-header',tables.headerColor); this.set(root,'--wl-table-border',tables.borderColor); this.set(root,'--wl-table-title',tables.titleColor); this.set(root,'--wl-table-text',tables.textColor); this.set(root,'--wl-table-muted',tables.mutedTextColor); this.set(root,'--wl-table-accent',tables.accentColor); this.set(root,'--wl-table-radius',(tables.radius||8)+'px'); this.set(root,'--wl-badge-bg',badges.headerColor); this.set(root,'--wl-badge-border',badges.borderColor); this.set(root,'--wl-badge-text',badges.textColor); this.set(root,'--wl-badge-accent',badges.accentColor); this.set(root,'--wl-badge-radius',(badges.radius||999)+'px'); this.set(root,'--wl-form-bg',forms.surfaceColor); this.set(root,'--wl-form-border',forms.borderColor); this.set(root,'--wl-form-text',forms.textColor); this.set(root,'--wl-form-muted',forms.mutedTextColor); this.set(root,'--wl-form-accent',forms.accentColor); this.set(root,'--wl-form-radius',(forms.radius||8)+'px'); this.set(root,'--wl-form-height',(forms.height||40)+'px');
    this.set(root,'--wl-ready','1');
  }
  private normalizeStyles(styles:any):WhiteLabelStyles { const source=styles||{}; return Object.keys(DEFAULT_STYLES).reduce((out,key)=>{ out[key as keyof WhiteLabelStyles]={...DEFAULT_APPEARANCE,...(DEFAULT_STYLES[key as keyof WhiteLabelStyles]||{}),...(source[key]||{})}; return out; },{} as WhiteLabelStyles); }
  private normalize(sections:any[]):WhiteLabelSection[]{ return sections.map(section=>({...section,items:Array.isArray(section.items)?section.items.map((item:any)=>({...item,appearance:{...DEFAULT_APPEARANCE,...(item.appearance||{})}})):[]})); }
  private enabled(sections:WhiteLabelSection[],kind:string){return sections.find(x=>x.kind===kind)?.items?.filter(x=>x.enabled!==false)||[];}
  private firstEnabled(sections:WhiteLabelSection[],kind:string){return this.enabled(sections,kind)[0];}
  private set(root:HTMLElement,name:string,value:string){root.style.setProperty(name,value);}
  private darken(hex:string){if(!/^#[0-9a-fA-F]{6}$/.test(hex))return '#1d4ed8';const r=Math.max(0,parseInt(hex.slice(1,3),16)-25),g=Math.max(0,parseInt(hex.slice(3,5),16)-25),b=Math.max(0,parseInt(hex.slice(5,7),16)-25);return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
}