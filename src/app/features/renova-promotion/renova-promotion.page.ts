import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./renova-promotion.page.html',styleUrl:'./renova-promotion.page.css'})
export class RenovaPromotionPage {
  product=''; market=''; language='de'; customerType='Building material distributors'; autoProspecting=true; autoEnrollment=true; planCreated=false;
  createPlan(){this.planCreated=!!this.product&&!!this.market;}
}
