import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.css'
})
export class CatalogPage {
  products = [
    { name: 'Renova Interior Putz', category: 'Interior Solutions', status: 'Published', markets: 'MK · AL · DE' },
    { name: 'Renova Exterior Finish', category: 'Exterior Solutions', status: 'Draft', markets: 'MK · AL' },
    { name: 'Renova Primer', category: 'Primers', status: 'Published', markets: 'MK · AL · DE · EN' }
  ];
}
