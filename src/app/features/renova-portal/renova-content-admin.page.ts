import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

type Lang='en'|'mk'|'sq'|'de';
type CmsSection='hero'|'intro'|'solutions'|'kpis'|'stories'|'events'|'locations';
interface Hero { id?:string; order?:number; active?:boolean; published?:boolean; imageUrl:string; kicker:Record<Lang,string>; title:Record<Lang,string>; text:Record<Lang,string>; primaryLabel:Record<Lang,string>; primaryUrl:string; secondaryLabel:Record<Lang,string>; secondaryUrl:string; }
interface SiteContent { version:number; status:string; companyIntro:string; heroes?:Hero[]; solutions:any[]; kpis:any[]; stories:any[]; events:any[]; locations:any[]; [key:string]:any; }

@Component({standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./renova-content-admin.page.html',styleUrl:'./renova-content-admin.page.css'})
export class RenovaContentAdminPage implements OnInit {
  tenantId='2f0c6e75-4df1-4bd5-bb49-6ef8ea0e3f1a';
  languages:Lang[]=['en','mk','sq','de'];
  sections:CmsSection[]=['hero','intro','solutions','kpis','stories','events','locations'];
  heroes:Hero[]=[];
  selected=0; loading=true; saving=false; message=''; error=''; section:CmsSection='hero';
  content:SiteContent={version:1,status:'Published',companyIntro:'',solutions:[],kpis:[],stories:[],events:[],locations:[]};
  readonly sectionLabels:Record<CmsSection,string>={hero:'Hero carousel',intro:'Company introduction',solutions:'Solutions',kpis:'Key figures',stories:'Projects & stories',events:'Events',locations:'Locations'};
  constructor(private api:ApiService){}
  ngOnInit():void{this.reload();}
  reload():void{this.loading=true;this.message='';this.error='';this.api.get<any>(`renova/catalog/site-content?tenant=renova`).subscribe({next:c=>{this.content={...this.content,...(c||{})};this.heroes=(c?.heroes||[]).slice().sort((a:any,b:any)=>(a.order??0)-(b.order??0));this.loading=false;},error:e=>{this.loading=false;this.error=e?.error?.detail||'Unable to load Renova portal content.';}});}
  selectSection(section:CmsSection):void{this.section=section;}
  add():void{this.heroes.push({id:crypto.randomUUID(),order:this.heroes.length+1,active:true,published:false,imageUrl:'',kicker:{en:'',mk:'',sq:'',de:''},title:{en:'',mk:'',sq:'',de:''},text:{en:'',mk:'',sq:'',de:''},primaryLabel:{en:'Explore',mk:'Истражи',sq:'Eksploro',de:'Entdecken'},primaryUrl:'#products',secondaryLabel:{en:'Contact',mk:'Контакт',sq:'Kontakti',de:'Kontakt'},secondaryUrl:'#contact'});this.selected=this.heroes.length-1;this.section='hero';}
  remove(index:number):void{this.heroes.splice(index,1);this.selected=Math.max(0,Math.min(this.selected,this.heroes.length-1));}
  move(index:number,delta:number):void{const target=index+delta;if(target<0||target>=this.heroes.length)return;[this.heroes[index],this.heroes[target]]=[this.heroes[target],this.heroes[index]];this.heroes.forEach((h,i)=>h.order=i+1);this.selected=target;}
  addItem(type:'solutions'|'kpis'|'stories'|'events'|'locations'):void{
    const defaults:any={solutions:{number:(this.content.solutions?.length||0)+1,title:'',description:''},kpis:{value:'',title:'',description:''},stories:{title:'',description:'',location:'',imageUrl:''},events:{title:'',description:''},locations:{name:'',type:'',address:'',url:''}};
    if(!Array.isArray(this.content[type]))this.content[type]=[];
    this.content[type].push(defaults[type]);
  }
  removeItem(type:'solutions'|'kpis'|'stories'|'events'|'locations',index:number):void{this.content[type].splice(index,1);if(type==='solutions')this.content.solutions.forEach((x:any,i:number)=>x.number=i+1);}
  save():void{this.saving=true;this.message='';this.error='';const payload={...this.content,heroes:this.heroes.map((h,i)=>({...h,order:i+1}))};this.api.put(`renova/catalog/site-content?tenant=renova`,payload).subscribe({next:()=>{this.saving=false;this.message='Published portal content saved.';this.content=payload;},error:e=>{this.saving=false;this.error=e?.error?.detail||'Unable to save portal content.';}});}
  trackByIndex(index:number):number{return index;}
}
