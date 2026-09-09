import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-editor.page.html',
  styleUrl: './product-editor.page.css'
})
export class ProductEditorPage {
  product = {
    name: '', code: '', category: 'Plasters / Putz', brand: 'Renova', shortDescription: '',
    description: '', benefits: '', applications: '', technicalSpecifications: '',
    packaging: '', weight: '', sku: '',
    languages: { en: true, mk: false, sq: false, de: false },
    promote: true, publish: false
  };

  saved = false;

  save(): void { this.saved = true; }
}
