import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandThemeService } from './core/brand-theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent implements OnInit {
  constructor(private brandTheme: BrandThemeService) {}

  ngOnInit() {
    this.brandTheme.load().subscribe();
  }
}
