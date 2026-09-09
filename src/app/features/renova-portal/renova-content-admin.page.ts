import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

type Lang='en'|'mk'|'sq'|'de';
interface Hero { id?:string; order?:number; active?:boolean; published?:boolean; imageUrl:string; kicker:Record<Lang,string>; title:Record<Lang,string>; text:Record<Lang,string>; primaryLabel:Record<Lang,string>; primaryUrl:string; secondaryLabel:Record<Lang,string>; secondaryUrl:string; }
@Component({standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./renova-content-admin.page.html',styleUrl:'./renova-content-admin.page.css'})
export class RenovaContentAdminPage implements OnInit {
  tenantId='2f0c6e75-4df1-4bd5-bb49-6ef8ea0e3f1a';
  languages:Lang[]=['en','mk','sq','de'];
  heroes:Hero[]=[];
  selected=0; loading=true; saving=false; message=''; error='';
  private content:any={version:1,status:'Published',companyIntro:'',solutions:[],kpis:[],stories:[],events:[],locations:[]};
  constructor(private api:ApiService){}
  ngOnInit():void{this.reload();}
  reload():void{this.loading=true;this.api.get<any>(`renova/catalog/site-content?tenant=renova`).subscribe({next:c=>{this.content=c||this.content;this.heroes=(c?.heroes||[]).sort((a:any,b:any)=>(a.order??0)-(b.order??0));this.loading=false;},error:e=>{this.loading=false;this.error=e?.error?.detail||'Unable to load Renova portal content.';}});}
  add():void{this.heroes.push({id:crypto.randomUUID(),order:this.heroes.length+1,active:true,published:false,imageUrl:'',kicker:{en:'',mk:'',sq:'',de:''},title:{en:'',mk:'',sq:'',de:''},text:{en:'',mk:'',sq:'',de:''},primaryLabel:{en:'Explore',mk:'Истражи',sq:'Eksploro',de:'Entdecken'},primaryUrl:'#products',secondaryLabel:{en:'Contact',mk:'Контакт',sq:'Kontakti',de:'Kontakt'},secondaryUrl:'#contact'});this.selected=this.heroes.length-1;}
  remove(index:number):void{this.heroes.splice(index,1);this.selected=Math.max(0,Math.min(this.selected,this.heroes.length-1));}
  move(index:number,delta:number):void{const target=index+delta;if(target<0||target>=this.heroes.length)return;[this.heroes[index],this.heroes[target]]=[this.heroes[target],this.heroes[index]];this.heroes.forEach((h,i)=>h.order=i+1);this.selected=target;}
  save():void{this.saving=true;this.message='';this.error='';const payload={...this.content,heroes:this.heroes.map((h,i)=>({...h,order:i+1}))};this.api.put(`renova/catalog/site-content?tenant=renova`,payload).subscribe({next:()=>{this.saving=false;this.message='Published portal content saved.';this.content=payload;},error:e=>{this.saving=false;this.error=e?.error?.detail||'Unable to save portal content.';}});}
  langValue(hero:Hero,key:'kicker'|'title'|'text'|'primaryLabel'|'secondaryLabel',lang:Lang):string{return hero[key][lang]||'';}
}
