import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RenovaPortalPage as BaseRenovaPortalPage } from './renova-portal.page';

type Lang = 'en' | 'mk' | 'sq' | 'de';
interface Hero { id?: string; order?: number; active?: boolean; published?: boolean; imageUrl: string; kicker: Record<Lang,string>; title: Record<Lang,string>; text: Record<Lang,string>; primaryLabel: Record<Lang,string>; primaryUrl: string; secondaryLabel: Record<Lang,string>; secondaryUrl: string; }
interface SiteContent { version:number; status:string; updatedAtUtc:string; companyIntro:string; heroes?: Hero[]; solutions:any[]; kpis:any[]; stories:any[]; events:any[]; locations:any[]; }

const DEMO_HEROES: Hero[] = [
 { imageUrl:'https://renova.com.mk/wp-content/uploads/2024/07/COVEREN.jpg', kicker:{en:'RENOVA / 1992—',mk:'РЕНОВА / 1992—',sq:'RENOVA / 1992—',de:'RENOVA / 1992—'}, title:{en:'Building better. Together.',mk:'Градиме подобро. Заедно.',sq:'Ndërtojmë më mirë. Së bashku.',de:'Besser bauen. Gemeinsam.'}, text:{en:'Professional construction materials for projects, distributors and builders across the Balkans.',mk:'Професионални градежни материјали за проекти, дистрибутери и изведувачи низ Балканот.',sq:'Materiale profesionale ndërtimi për projekte, distributorë dhe ndërtues në Ballkan.',de:'Professionelle Baustoffe für Projekte, Vertriebspartner und Bauunternehmen auf dem Balkan.'}, primaryLabel:{en:'Explore products',mk:'Истражи производи',sq:'Eksploro produktet',de:'Produkte entdecken'}, primaryUrl:'#products', secondaryLabel:{en:'Talk to Renova',mk:'Контактирајте ја Ренова',sq:'Kontakto Renova',de:'Renova kontaktieren'}, secondaryUrl:'#contact'},
 { imageUrl:'https://renova.com.mk/wp-content/uploads/2024/07/OBJEKTET-ENArtboard-1.jpg', kicker:{en:'RENOVA / FACILITIES',mk:'РЕНОВА / ФАБРИКИ',sq:'RENOVA / FABRIKAT',de:'RENOVA / WERKE'}, title:{en:'Production built around quality.',mk:'Производство посветено на квалитет.',sq:'Prodhim i ndërtuar mbi cilësi.',de:'Produktion mit Fokus auf Qualität.'}, text:{en:'Explore Renova facilities and the production capabilities behind the portfolio.',mk:'Запознајте ги објектите на Ренова и производните капацитети зад портфолиото.',sq:'Eksploroni objektet e Renova dhe kapacitetet prodhuese pas portofolit.',de:'Entdecken Sie die Renova-Standorte und Produktionskapazitäten hinter dem Portfolio.'}, primaryLabel:{en:'View facilities',mk:'Погледнете ги фабриките',sq:'Shiko objektet',de:'Standorte ansehen'}, primaryUrl:'#locations', secondaryLabel:{en:'Company',mk:'Компанија',sq:'Kompania',de:'Unternehmen'}, secondaryUrl:'#company'},
 { imageUrl:'https://renova.com.mk/wp-content/uploads/2024/06/a356_ho_00_p_2048x1536.jpg', kicker:{en:'RENOVA / PROJECTS',mk:'РЕНОВА / ПРОЕКТИ',sq:'RENOVA / PROJEKTET',de:'RENOVA / PROJEKTE'}, title:{en:'Built for real projects.',mk:'Создадено за реални проекти.',sq:'Ndërtuar për projekte reale.',de:'Für reale Projekte gebaut.'}, text:{en:'From construction materials to hospitality and commercial projects, discover Renova in the real world.',mk:'Од градежни материјали до хотелски и комерцијални проекти, запознајте ја Ренова во реална примена.',sq:'Nga materialet e ndërtimit te projektet hoteliere dhe komerciale, zbuloni Renova në praktikë.',de:'Von Baustoffen bis zu Hotel- und Gewerbeprojekten: Renova in der praktischen Anwendung.'}, primaryLabel:{en:'Explore projects',mk:'Истражи проекти',sq:'Eksploro projektet',de:'Projekte entdecken'}, primaryUrl:'#projects', secondaryLabel:{en:'Contact',mk:'Контакт',sq:'Kontakti',de:'Kontakt'}, secondaryUrl:'#contact'}
];

@Component({standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./renova-portal-v2.page.html',styleUrl:'./renova-portal-v2.page.css'})
export class RenovaPortalV2Page extends BaseRenovaPortalPage implements OnInit,OnDestroy {
  heroesV2:Hero[] = DEMO_HEROES;
  companyIntro='';
  heroTimerV2?:ReturnType<typeof setInterval>;
  private readonly apiClient:ApiService;
  private readonly routeClient:ActivatedRoute;

  constructor(api:ApiService,route:ActivatedRoute){super(api,route);this.apiClient=api;this.routeClient=route;}
  get hero():Hero{return this.heroesV2[this.heroIndex] || DEMO_HEROES[0];}
  get heroKicker():string{return this.hero.kicker[this.language];}
  get heroTitle():string{return this.hero.title[this.language];}
  get heroText():string{return this.hero.text[this.language];}
  get heroPrimaryLabel():string{return this.hero.primaryLabel[this.language];}
  get heroSecondaryLabel():string{return this.hero.secondaryLabel[this.language];}
  override ngOnInit():void{
    const requested=this.routeClient.snapshot.queryParamMap.get('language') as Lang|null;
    if(requested&&this.languages.includes(requested as any))this.language=requested;
    this.loadContent();
    this.loadProductsV2();
    this.startHeroV2();
  }
  override ngOnDestroy():void{if(this.heroTimerV2)clearInterval(this.heroTimerV2);super.ngOnDestroy();}
  startHeroV2():void{if(this.heroTimerV2)clearInterval(this.heroTimerV2);this.heroTimerV2=setInterval(()=>this.nextHeroV2(),6500);}
  nextHeroV2():void{if(this.heroesV2.length)this.heroIndex=(this.heroIndex+1)%this.heroesV2.length;}
  prevHeroV2():void{if(this.heroesV2.length)this.heroIndex=(this.heroIndex-1+this.heroesV2.length)%this.heroesV2.length;}
  pauseHeroV2():void{if(this.heroTimerV2){clearInterval(this.heroTimerV2);this.heroTimerV2=undefined;}}
  resumeHeroV2():void{if(!this.heroTimerV2)this.startHeroV2();}
  override setLanguage(language:any):void{this.language=language as Lang;this.inquirySent=false;this.updateUrl();this.loadContent();this.loadProductsV2();}
  private loadContent():void{
    this.apiClient.get<SiteContent>(`public/portal/${this.tenantId}/site-content?tenant=renova&language=${this.language.toUpperCase()}`).subscribe({next:c=>{
      if(!c)return;
      this.companyIntro=c.companyIntro||'';
      if(c.heroes?.length)this.heroesV2=c.heroes.filter(x=>x.active!==false&&x.published!==false).sort((a,b)=>(a.order??0)-(b.order??0));
      if(!this.heroesV2.length)this.heroesV2=DEMO_HEROES;
      this.heroIndex=Math.min(this.heroIndex,this.heroesV2.length-1);
      Object.assign(this as any,{solutions:c.solutions?.map(x=>[x.number,x.title,x.description])||[],kpis:c.kpis?.map(x=>[x.value,x.title,x.description])||[],stories:c.stories?.map(x=>[x.title,x.description,x.type||'Project',x.location,x.imageUrl])||[],events:c.events?.map(x=>[x.title,x.description,x.url||''])||[],locations:c.locations?.map(x=>[x.name,x.type,x.address,x.url])||[]});
    },error:err=>this.error=err?.error?.detail||'Unable to load Renova site content.'});
  }
  private loadProductsV2():void{
    this.loading=true;this.error='';
    this.apiClient.get<any[]>(`public/portal/${this.tenantId}/products?tenant=renova&language=${this.language.toUpperCase()}`).subscribe({next:products=>{this.products=products||[];this.selected=this.products[0]||null;this.loading=false;if(this.selected)this.loadDetailV2(this.selected.slug);},error:err=>{this.loading=false;this.error=err?.error?.detail||'Unable to load the Renova catalog.';}});
  }
  private loadDetailV2(slug:string):void{this.apiClient.get<any>(`public/portal/${this.tenantId}/products/${encodeURIComponent(slug)}?tenant=renova&language=${this.language.toUpperCase()}`).subscribe({next:p=>this.selected=p,error:()=>undefined});}
}
