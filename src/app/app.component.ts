import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandThemeService } from './core/brand-theme.service';
import { WhiteLabelConfigService } from './core/white-label-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent implements OnInit {
  constructor(private brandTheme: BrandThemeService, private whiteLabelConfig: WhiteLabelConfigService) {}

  ngOnInit() {
    this.brandTheme.load().subscribe();
  }
}
