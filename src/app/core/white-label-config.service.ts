import { Injectable, signal } from '@angular/core';

export interface WhiteLabelItemAppearance {
  surfaceColor: string; headerColor: string; borderColor: string;
  titleColor: string; textColor: string; mutedTextColor: string; accentColor: string;
  buttonBackgroundColor?: string; buttonTextColor?: string; buttonBorderColor?: string; buttonHoverBackgroundColor?: string;
  height: number; radius: number;
}
export interface WhiteLabelStyle extends WhiteLabelItemAppearance {
  padding?: number;
  gap?: number;
  fontSize?: number;
  fontWeight?: number;
  shadow?: string;
}
export interface WhiteLabelGlobalTokens {
  appBackground:string; surface:string; line:string; text:string; muted:string; accent:string;
  nav:string; navPanel:string; navBorder:string; navMuted:string; navHover:string; navAccent:string;
  success:string; danger:string; warning:string; info:string;
  surfaceMuted:string; inputPlaceholder:string; tableHeader:string; tableLine:string;
  accentSoft:string; accentBorder:string; avatarBg:string; avatarText:string;
  pageMaxWidth:number; pagePaddingX:number; pagePaddingY:number; pagePaddingBottom:number;
  sidebarWidth:number; sidebarPaddingX:number; sidebarPaddingY:number;
  headerHeight:number; headerPaddingX:number; headerGap:number;
  pageHeaderTitleSize:number; pageHeaderGap:number;
  cardRadius:number; cardPadding:number; cardGap:number; cardShadow:string;
  controlHeight:number; controlRadius:number;
  modalRadius:number; modalShadow:string;
}
export interface WhiteLabelStyles { global:WhiteLabelGlobalTokens; header:WhiteLabelStyle; grid:WhiteLabelStyle; kpis:WhiteLabelStyle; cards:WhiteLabelStyle; buttons:WhiteLabelStyle; text:WhiteLabelStyle; steps:WhiteLabelStyle; lists:WhiteLabelStyle; tables:WhiteLabelStyle; badges:WhiteLabelStyle; forms:WhiteLabelStyle; tabs:WhiteLabelStyle; dataGrid:WhiteLabelStyle; navigation:WhiteLabelStyle; modals:WhiteLabelStyle; notices:WhiteLabelStyle; }
export interface WhiteLabelItem { id:string; label:string; template:string; enabled:boolean; }
export interface WhiteLabelSection { id:string; kind:string; label:string; columns:number; expanded?:boolean; items:WhiteLabelItem[]; }

const STORAGE_KEY='qai-white-label-page-layout-v2';
const STYLE_KEY='qai-white-label-component-styles-v2';
const DEFAULT_GLOBAL_TOKENS:WhiteLabelGlobalTokens={appBackground:'#f7f7f8',surface:'#ffffff',line:'#e6e8eb',text:'#171717',muted:'#737373',accent:'#f59e0b',nav:'#ffffff',navPanel:'#ffffff',navBorder:'#e6e8eb',navMuted:'#737373',navHover:'#fff4df',navAccent:'#f59e0b',success:'#15803d',danger:'#dc2626',warning:'#f59e0b',info:'#f59e0b',surfaceMuted:'#fafafa',inputPlaceholder:'#a3a3a3',tableHeader:'#fafafa',tableLine:'#eeeeee',accentSoft:'#fff4df',accentBorder:'#ffd08a',avatarBg:'#fff0cf',avatarText:'#b45309',pageMaxWidth:1600,pagePaddingX:26,pagePaddingY:22,pagePaddingBottom:40,sidebarWidth:248,sidebarPaddingX:14,sidebarPaddingY:20,headerHeight:58,headerPaddingX:24,headerGap:14,pageHeaderTitleSize:22,pageHeaderGap:18,cardRadius:0,cardPadding:15,cardGap:12,cardShadow:'0 5px 16px rgba(15,23,42,.047)',controlHeight:36,controlRadius:8,modalRadius:12,modalShadow:'0 25px 60px rgba(0,0,0,.20)'};
const DEFAULT_APPEARANCE:WhiteLabelStyle={surfaceColor:'#ffffff',headerColor:'#ffffff',borderColor:'#e5e9f0',titleColor:'#101828',textColor:'#344054',mutedTextColor:'#667085',accentColor:'#f59e0b',buttonBackgroundColor:'#f59e0b',buttonTextColor:'#ffffff',buttonBorderColor:'#f59e0b',buttonHoverBackgroundColor:'#d97706',height:0,radius:11,padding:15,gap:12,fontSize:13,fontWeight:600,shadow:'0 1px 2px rgba(16,24,40,.03), 0 4px 14px rgba(36,60,88,.045)'};
const DEFAULT_STYLES:WhiteLabelStyles={global:DEFAULT_GLOBAL_TOKENS,header:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:58,radius:0,padding:24,gap:14,fontSize:16},grid:{...DEFAULT_APPEARANCE,height:0,radius:12},kpis:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:0},cards:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:0},buttons:{...DEFAULT_APPEARANCE,buttonTextColor:'#ffffff',height:44,radius:8,padding:13,fontSize:11,fontWeight:650},text:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:0},steps:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:12},lists:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:12},tables:{...DEFAULT_APPEARANCE,headerColor:'#f8fafc',height:0,radius:8},badges:{...DEFAULT_APPEARANCE,headerColor:'#fff4df',accentColor:'#f59e0b',height:0,radius:999},forms:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:36,radius:8},tabs:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:8},dataGrid:{...DEFAULT_APPEARANCE,headerColor:'#f8fafc',height:0,radius:8},navigation:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:8},modals:{...DEFAULT_APPEARANCE,headerColor:'#ffffff',height:0,radius:12},notices:{...DEFAULT_APPEARANCE,headerColor:'#fff4df',height:0,radius:8}};

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
    const wlGlobal=styles.global;this.set(root,'--wl-bg',wlGlobal.appBackground); this.set(root,'--wl-panel',wlGlobal.surface); this.set(root,'--wl-line',wlGlobal.line); this.set(root,'--wl-text',wlGlobal.text); this.set(root,'--wl-muted',wlGlobal.muted); this.set(root,'--wl-blue',wlGlobal.accent); this.set(root,'--wl-nav',wlGlobal.nav); this.set(root,'--wl-nav-panel',wlGlobal.navPanel); this.set(root,'--wl-nav-border',wlGlobal.navBorder); this.set(root,'--wl-nav-muted',wlGlobal.navMuted); this.set(root,'--wl-nav-hover',wlGlobal.navHover); this.set(root,'--wl-nav-accent',wlGlobal.navAccent); this.set(root,'--wl-green',wlGlobal.success); this.set(root,'--wl-red',wlGlobal.danger); this.set(root,'--wl-amber',wlGlobal.warning); this.set(root,'--wl-info',wlGlobal.info); this.set(root,'--wl-surface-muted',wlGlobal.surfaceMuted); this.set(root,'--wl-input-placeholder',wlGlobal.inputPlaceholder); this.set(root,'--wl-table-header',wlGlobal.tableHeader); this.set(root,'--wl-table-line',wlGlobal.tableLine); this.set(root,'--wl-accent-soft',wlGlobal.accentSoft); this.set(root,'--wl-accent-border',wlGlobal.accentBorder); this.set(root,'--wl-avatar-bg',wlGlobal.avatarBg); this.set(root,'--wl-avatar-text',wlGlobal.avatarText); this.set(root,'--wl-page-max-width',wlGlobal.pageMaxWidth+'px'); this.set(root,'--wl-page-padding-x',wlGlobal.pagePaddingX+'px'); this.set(root,'--wl-page-padding-y',wlGlobal.pagePaddingY+'px'); this.set(root,'--wl-page-padding-bottom',wlGlobal.pagePaddingBottom+'px'); this.set(root,'--wl-sidebar-width',wlGlobal.sidebarWidth+'px'); this.set(root,'--wl-sidebar-padding-x',wlGlobal.sidebarPaddingX+'px'); this.set(root,'--wl-sidebar-padding-y',wlGlobal.sidebarPaddingY+'px'); this.set(root,'--wl-header-height',wlGlobal.headerHeight+'px'); this.set(root,'--wl-header-padding-x',wlGlobal.headerPaddingX+'px'); this.set(root,'--wl-header-gap',wlGlobal.headerGap+'px'); this.set(root,'--wl-page-header-title-size',wlGlobal.pageHeaderTitleSize+'px'); this.set(root,'--wl-page-header-gap',wlGlobal.pageHeaderGap+'px'); this.set(root,'--wl-card-radius',wlGlobal.cardRadius+'px'); this.set(root,'--wl-card-padding',wlGlobal.cardPadding+'px'); this.set(root,'--wl-card-gap',wlGlobal.cardGap+'px'); this.set(root,'--wl-card-shadow',wlGlobal.cardShadow); this.set(root,'--wl-control-height',wlGlobal.controlHeight+'px'); this.set(root,'--wl-control-radius',wlGlobal.controlRadius+'px'); this.set(root,'--wl-modal-radius',wlGlobal.modalRadius+'px'); this.set(root,'--wl-modal-shadow',wlGlobal.modalShadow); 
    const header=styles.header;
    const card=styles.cards;
    const grid=styles.grid;
    const kpis=styles.kpis;
    const buttonsStyle=styles.buttons;
    const text=styles.text; const steps=styles.steps; const lists=styles.lists; const tables=styles.tables; const badges=styles.badges; const forms=styles.forms; const tabs=styles.tabs; const dataGrid=styles.dataGrid; const navigation=styles.navigation; const modals=styles.modals; const notices=styles.notices;
    this.set(root,'--wl-app-surface',card.surfaceColor); this.set(root,'--wl-surface',card.surfaceColor); this.set(root,'--wl-text',card.textColor); this.set(root,'--wl-muted',card.mutedTextColor); this.set(root,'--wl-border',card.borderColor); this.set(root,'--wl-accent',card.accentColor); this.set(root,'--wl-accent-hover',card.buttonHoverBackgroundColor||this.darken(card.accentColor)); this.set(root,'--wl-accent-soft',wlGlobal.accentSoft); this.set(root,'--wl-grid-gap',(grid.gap||12)+'px'); this.set(root,'--wl-grid-columns','2'); this.set(root,'--wl-header-bg',header.headerColor); this.set(root,'--wl-header-border',header.borderColor);
    this.set(root,'--wl-header-title',header.titleColor); this.set(root,'--wl-header-text',header.textColor); this.set(root,'--wl-header-muted',header.mutedTextColor); this.set(root,'--wl-header-height',(header.height||64)+'px'); this.set(root,'--wl-header-padding',(header.padding||14)+'px'); this.set(root,'--wl-header-gap',(header.gap||20)+'px'); this.set(root,'--wl-header-font-size',(header.fontSize||16)+'px');
    this.set(root,'--wl-card-bg',card.surfaceColor); this.set(root,'--wl-card-header-bg',card.headerColor); this.set(root,'--wl-card-border',card.borderColor);
    this.set(root,'--wl-card-title',card.titleColor); this.set(root,'--wl-card-text',card.textColor); this.set(root,'--wl-card-muted',card.mutedTextColor); this.set(root,'--wl-card-accent',card.accentColor); this.set(root,'--wl-card-radius',card.radius+'px'); this.set(root,'--wl-card-padding',(card.padding||16)+'px'); this.set(root,'--wl-card-gap',(card.gap||12)+'px'); this.set(root,'--wl-card-font-size',(card.fontSize||14)+'px'); this.set(root,'--wl-card-shadow',card.shadow||'0 4px 14px rgba(15,47,104,.05)');
    ['button-01','button-02','button-03','button-04'].forEach((template,index)=>{ const a=buttonsStyle; const n=index+1; this.set(root,'--wl-button-'+n+'-bg',a.buttonBackgroundColor||a.accentColor); this.set(root,'--wl-button-'+n+'-text',a.buttonTextColor||'#ffffff'); this.set(root,'--wl-button-'+n+'-border',a.buttonBorderColor||a.accentColor); this.set(root,'--wl-button-'+n+'-hover',a.buttonHoverBackgroundColor||this.darken(a.buttonBackgroundColor||a.accentColor)); });
    this.set(root,'--wl-kpi-1',kpis.accentColor); this.set(root,'--wl-kpi-2',kpis.accentColor); this.set(root,'--wl-kpi-3',kpis.accentColor); this.set(root,'--wl-kpi-4',kpis.accentColor); this.set(root,'--wl-kpi-5',kpis.accentColor); this.set(root,'--wl-kpi-bg',kpis.surfaceColor); this.set(root,'--wl-kpi-header',kpis.headerColor); this.set(root,'--wl-kpi-border',kpis.borderColor); this.set(root,'--wl-kpi-title',kpis.titleColor); this.set(root,'--wl-kpi-text',kpis.textColor); this.set(root,'--wl-kpi-muted',kpis.mutedTextColor); this.set(root,'--wl-kpi-radius',kpis.radius+'px'); this.set(root,'--wl-kpi-padding',(kpis.padding||16)+'px'); this.set(root,'--wl-kpi-shadow',kpis.shadow||'0 4px 14px rgba(15,47,104,.05)'); this.set(root,'--wl-button-global-bg',buttonsStyle.buttonBackgroundColor||buttonsStyle.accentColor); this.set(root,'--wl-button-global-text',buttonsStyle.buttonTextColor||'#fff'); this.set(root,'--wl-button-global-border',buttonsStyle.buttonBorderColor||buttonsStyle.accentColor); this.set(root,'--wl-button-global-hover',buttonsStyle.buttonHoverBackgroundColor||this.darken(buttonsStyle.accentColor)); this.set(root,'--wl-button-radius',buttonsStyle.radius+'px'); this.set(root,'--wl-button-padding-y',Math.max(6,Math.round((buttonsStyle.padding||10)*0.6))+'px'); this.set(root,'--wl-button-padding-x',Math.max(8,Math.round((buttonsStyle.padding||10)*0.9))+'px'); this.set(root,'--wl-button-font-size',(buttonsStyle.fontSize||10)+'px'); this.set(root,'--wl-button-font-weight',String(buttonsStyle.fontWeight||700)); this.set(root,'--wl-text-surface',text.surfaceColor); this.set(root,'--wl-text-padding',(text.padding||18)+'px'); this.set(root,'--wl-text-title-size',(text.fontSize||14)+'px'); this.set(root,'--wl-text-body-size',Math.max(10,(text.fontSize||14)-3)+'px'); this.set(root,'--wl-text-shadow',text.shadow||'none'); this.set(root,'--wl-text-border',text.borderColor); this.set(root,'--wl-text-radius',(text.radius||0)+'px'); this.set(root,'--wl-text-title',text.titleColor); this.set(root,'--wl-text-body',text.textColor); this.set(root,'--wl-text-muted',text.mutedTextColor); this.set(root,'--wl-steps-bg',steps.surfaceColor); this.set(root,'--wl-steps-header',steps.headerColor); this.set(root,'--wl-steps-border',steps.borderColor); this.set(root,'--wl-steps-title',steps.titleColor); this.set(root,'--wl-steps-text',steps.textColor); this.set(root,'--wl-steps-muted',steps.mutedTextColor); this.set(root,'--wl-steps-accent',steps.accentColor); this.set(root,'--wl-steps-radius',(steps.radius||12)+'px'); this.set(root,'--wl-list-bg',lists.surfaceColor); this.set(root,'--wl-list-border',lists.borderColor); this.set(root,'--wl-list-title',lists.titleColor); this.set(root,'--wl-list-text',lists.textColor); this.set(root,'--wl-list-muted',lists.mutedTextColor); this.set(root,'--wl-list-accent',lists.accentColor); this.set(root,'--wl-list-radius',(lists.radius||12)+'px'); this.set(root,'--wl-table-bg',tables.surfaceColor); this.set(root,'--wl-table-header',tables.headerColor); this.set(root,'--wl-table-border',tables.borderColor); this.set(root,'--wl-table-title',tables.titleColor); this.set(root,'--wl-table-text',tables.textColor); this.set(root,'--wl-table-muted',tables.mutedTextColor); this.set(root,'--wl-table-accent',tables.accentColor); this.set(root,'--wl-table-radius',(tables.radius||8)+'px'); this.set(root,'--wl-badge-bg',badges.headerColor); this.set(root,'--wl-badge-border',badges.borderColor); this.set(root,'--wl-badge-text',badges.textColor); this.set(root,'--wl-badge-accent',badges.accentColor); this.set(root,'--wl-badge-radius',(badges.radius||999)+'px'); this.set(root,'--wl-form-bg',forms.surfaceColor); this.set(root,'--wl-form-border',forms.borderColor); this.set(root,'--wl-form-text',forms.textColor); this.set(root,'--wl-form-muted',forms.mutedTextColor); this.set(root,'--wl-form-accent',forms.accentColor); this.set(root,'--wl-form-radius',(forms.radius||8)+'px'); this.set(root,'--wl-form-height',(forms.height||40)+'px'); this.set(root,'--wl-tabs-bg',tabs.surfaceColor); this.set(root,'--wl-tabs-border',tabs.borderColor); this.set(root,'--wl-tabs-text',tabs.textColor); this.set(root,'--wl-tabs-muted',tabs.mutedTextColor); this.set(root,'--wl-tabs-accent',tabs.accentColor); this.set(root,'--wl-tabs-radius',(tabs.radius||8)+'px'); this.set(root,'--wl-grid-bg',dataGrid.surfaceColor); this.set(root,'--wl-grid-header',dataGrid.headerColor); this.set(root,'--wl-grid-border',dataGrid.borderColor); this.set(root,'--wl-grid-text',dataGrid.textColor); this.set(root,'--wl-grid-muted',dataGrid.mutedTextColor); this.set(root,'--wl-grid-accent',dataGrid.accentColor); this.set(root,'--wl-grid-radius',(dataGrid.radius||8)+'px'); this.set(root,'--wl-nav-bg',navigation.surfaceColor); this.set(root,'--wl-nav-border',navigation.borderColor); this.set(root,'--wl-nav-text',navigation.textColor); this.set(root,'--wl-nav-muted',navigation.mutedTextColor); this.set(root,'--wl-nav-accent',navigation.accentColor); this.set(root,'--wl-nav-radius',(navigation.radius||8)+'px'); this.set(root,'--wl-modal-bg',modals.surfaceColor); this.set(root,'--wl-modal-header',modals.headerColor); this.set(root,'--wl-modal-border',modals.borderColor); this.set(root,'--wl-modal-title',modals.titleColor); this.set(root,'--wl-modal-text',modals.textColor); this.set(root,'--wl-modal-radius',(modals.radius||12)+'px'); this.set(root,'--wl-notice-bg',notices.headerColor); this.set(root,'--wl-notice-border',notices.borderColor); this.set(root,'--wl-notice-text',notices.textColor); this.set(root,'--wl-notice-accent',notices.accentColor); this.set(root,'--wl-notice-radius',(notices.radius||8)+'px');
    this.set(root,'--wl-ready','1');
  }
  private normalizeStyles(styles:any):WhiteLabelStyles {
    const source=styles||{};
    const out:any={global:{...DEFAULT_GLOBAL_TOKENS,...(source.global||{})}};
    for(const key of Object.keys(DEFAULT_STYLES)){ out[key]={...DEFAULT_APPEARANCE,...(DEFAULT_STYLES[key as keyof WhiteLabelStyles]||{}),...(source[key]||{})}; }
    // Migrate the previous blue visual system to the current orange/neutral product language.
    const ORANGE='#f59e0b'; const ORANGE_HOVER='#d97706'; const ORANGE_SOFT='#fff4df'; const ORANGE_BORDER='#ffd08a';
    if(out.global.accent==='#2563eb') out.global.accent=ORANGE;
    if(out.global.info==='#2563eb') out.global.info=ORANGE;
    if(out.global.accentSoft==='#edf4ff') out.global.accentSoft=ORANGE_SOFT;
    if(out.global.accentBorder==='#cfe0ff') out.global.accentBorder=ORANGE_BORDER;
    if(out.global.avatarBg==='#dbeafe') out.global.avatarBg='#fff0cf';
    if(out.global.avatarText==='#1d4ed8') out.global.avatarText='#b45309';
    for(const key of Object.keys(DEFAULT_STYLES)){
      const style=out[key];
      if(!style) continue;
      if(style.accentColor==='#2563eb' || style.accentColor==='#4f46e5') style.accentColor=ORANGE;
      if(style.buttonBackgroundColor==='#2563eb') style.buttonBackgroundColor=ORANGE;
      if(style.buttonBorderColor==='#2563eb') style.buttonBorderColor=ORANGE;
      if(style.buttonHoverBackgroundColor==='#1d4ed8') style.buttonHoverBackgroundColor=ORANGE_HOVER;
      if(style.headerColor==='#edf4ff' && key!=='header') style.headerColor=ORANGE_SOFT;
    }
    // Migrate the previous visual defaults so existing saved White Label settings follow the current system.
    if(out.global.cardRadius===11) out.global.cardRadius=0;
    if(out.cards?.headerColor==='#e4eaf3' || out.cards?.headerColor==='#f2f5fb') out.cards.headerColor='#ffffff';
    if(out.cards?.radius===11 || out.cards?.radius===12) out.cards.radius=0;
    if(out.buttons?.radius===0 || out.buttons?.radius===9) out.buttons.radius=8;
    if(out.badges?.headerColor==='#edf4ff' || out.badges?.headerColor==='#eef2ff') out.badges.headerColor=ORANGE_SOFT;
    if(out.badges?.accentColor==='#2563eb' || out.badges?.accentColor==='#4f46e5') out.badges.accentColor=ORANGE;
    return out as WhiteLabelStyles;
  }
  private normalize(sections:any[]):WhiteLabelSection[]{ return sections.map(section=>({...section,items:Array.isArray(section.items)?section.items.map((item:any)=>{const {appearance,...clean}=item||{}; return clean;}):[]})); }
  private enabled(sections:WhiteLabelSection[],kind:string){return sections.find(x=>x.kind===kind)?.items?.filter(x=>x.enabled!==false)||[];}
  private firstEnabled(sections:WhiteLabelSection[],kind:string){return this.enabled(sections,kind)[0];}
  private set(root:HTMLElement,name:string,value:string){root.style.setProperty(name,value);}
  private darken(hex:string){if(!/^#[0-9a-fA-F]{6}$/.test(hex))return '#1d4ed8';const r=Math.max(0,parseInt(hex.slice(1,3),16)-25),g=Math.max(0,parseInt(hex.slice(3,5),16)-25),b=Math.max(0,parseInt(hex.slice(5,7),16)-25);return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
}