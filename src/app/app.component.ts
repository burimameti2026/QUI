import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminStaticI18nDirective } from './core/admin-static-i18n.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminStaticI18nDirective],
  template: '<div class="app-i18n-root" qaiAdminStaticI18n><router-outlet /></div>'
})
export class AppComponent {}
