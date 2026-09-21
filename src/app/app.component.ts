import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandThemeService } from './core/brand-theme.service';
import { WhiteLabelConfigService } from './core/white-label-config.service';
import { AdminStaticI18nDirective } from './core/admin-static-i18n.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminStaticI18nDirective],
  template: '<div class="app-i18n-shell" qaiAdminStaticI18n><router-outlet /></div>'
})
export class AppComponent implements OnInit {
  constructor(private brandTheme: BrandThemeService, private whiteLabelConfig: WhiteLabelConfigService) {}

  ngOnInit() {
    this.brandTheme.load().subscribe();
  }
}
