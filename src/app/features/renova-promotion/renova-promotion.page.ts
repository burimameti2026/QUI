import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';

interface Product { id: string; name: string; code: string; }
interface Market { id?: string; countryCode: string; countryName: string; defaultLanguage: string; }

@Component({standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./renova-promotion.page.html',styleUrl:'./renova-promotion.page.css'})
export class RenovaPromotionPage implements OnInit {
  products: Product[] = [];
  markets: Market[] = [];
  readonly defaultMarkets: Market[] = [
    { countryCode:'MK', countryName:'North Macedonia', defaultLanguage:'mk' },
    { countryCode:'AL', countryName:'Albania', defaultLanguage:'sq' },
    { countryCode:'XK', countryName:'Kosovo', defaultLanguage:'sq' },
    { countryCode:'DE', countryName:'Germany', defaultLanguage:'de' },
    { countryCode:'AT', countryName:'Austria', defaultLanguage:'de' }
  ];
  product=''; market=''; language='de'; customerType='Building material distributors'; autoProspecting=true; autoEnrollment=true;
  planCreated=false; saving=false; loadingMarkets=false; error='';

  constructor(private api:ApiService, private route:ActivatedRoute) {}

  ngOnInit():void {
    this.api.get<Product[]>('renova/catalog/products').subscribe({
      next:products=>{
        this.products=products;
        const requested=this.route.snapshot.queryParamMap.get('productId');
        this.product=requested&&products.some(p=>p.id===requested)?requested:products[0]?.id||'';
        if(this.product) this.loadMarkets();
      },
      error:err=>this.error=this.message(err)
    });
  }

  onProductChange():void {
    this.market='';
    if(this.product) this.loadMarkets();
  }

  private loadMarkets():void {
    this.loadingMarkets=true;
    this.api.get<Market[]>(`renova/catalog/products/${this.product}/markets`).subscribe({
      next:markets=>{
        this.markets=markets?.length?markets:this.defaultMarkets;
        this.loadingMarkets=false;
        if(!this.market) this.market=this.markets[0]?.countryName||'';
      },
      error:err=>{
        this.markets=this.defaultMarkets;
        this.loadingMarkets=false;
        if(!this.market) this.market=this.markets[0]?.countryName||'';
        this.error=this.message(err);
      }
    });
  }

  createPlan():void {
    if(!this.product||!this.market||this.saving) return;
    const selected=this.markets.find(m=>m.countryName===this.market); if(!selected) return;
    this.saving=true; this.planCreated=false; this.error='';

    const ensureMarket=(done:(market:Market)=>void):void=>{
      if(selected.id){ done(selected); return; }
      this.api.post<Market>(`renova/catalog/products/${this.product}/markets`,{
        countryCode:selected.countryCode,countryName:selected.countryName,defaultLanguage:selected.defaultLanguage,isActive:true
      }).subscribe({
        next:market=>{ this.markets=this.markets.map(m=>m.countryCode===selected.countryCode?market:m); done(market); },
        error:err=>{ this.error=this.message(err); this.saving=false; }
      });
    };

    ensureMarket(market=>{
      this.api.post<any>('renova/catalog/promotion-plans',{
        catalogProductId:this.product,targetMarketId:market.id,
        name:`${this.products.find(p=>p.id===this.product)?.name||'Renova'} — ${market.countryName}`,
        campaignLanguage:this.language,countryCode:market.countryCode,countryName:market.countryName,
        targetIndustries:'Construction and building materials',targetCustomerTypes:this.customerType,targetCustomerProfile:this.customerType,
        qualificationRules:'Prioritize active distributors, construction companies and buyers with verified business presence.',
        messagingStrategy:'Product-led outreach localized to the target market and campaign language.',
        enableAutonomousProspecting:this.autoProspecting,enableAutomaticCampaignEnrollment:this.autoEnrollment
      }).subscribe({
        next:plan=>{
          if(this.autoProspecting||this.autoEnrollment){
            this.api.post<any>(`renova/catalog/promotion-plans/${plan.id}/activate`,{}).subscribe({
              next:()=>{this.planCreated=true;this.saving=false;},error:err=>{this.error=this.message(err);this.saving=false;}
            });
          } else { this.planCreated=true;this.saving=false; }
        },
        error:err=>{this.error=this.message(err);this.saving=false;}
      });
    });
  }

  private message(err:any):string{return err?.error?.detail||err?.error?.title||err?.message||'Unable to save the promotion plan.';}
}
